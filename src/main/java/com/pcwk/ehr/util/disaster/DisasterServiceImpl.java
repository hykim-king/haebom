package com.pcwk.ehr.util.disaster;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcwk.ehr.domain.DisasterItemVO;
import com.pcwk.ehr.domain.DisasterResponseVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DisasterServiceImpl implements DisasterService {

    private final Logger log = LogManager.getLogger(getClass());

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${disaster.api.service-key}")
    private String serviceKey;

    private static final String BASE_URL = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247";
    private static final String RETURN_TYPE = "json";
    private static final int NUM_OF_ROWS = 200;
    private static final long RECENT_HOURS = 24L;

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Seoul");

    private static final DateTimeFormatter FMT_YYYYMMDD_HHMMSS = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private static final DateTimeFormatter FMT_YYYYMMDD_HHMM = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    private static final DateTimeFormatter FMT_YYYYMMDD = DateTimeFormatter.BASIC_ISO_DATE;

    private static final DateTimeFormatter FMT_DASH_DATETIME = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd")
            .optionalStart().appendLiteral(' ').optionalEnd()
            .optionalStart().appendPattern("HH:mm").optionalEnd()
            .optionalStart().appendPattern(":ss").optionalEnd()
            .parseDefaulting(ChronoField.HOUR_OF_DAY, 0)
            .parseDefaulting(ChronoField.MINUTE_OF_HOUR, 0)
            .parseDefaulting(ChronoField.SECOND_OF_MINUTE, 0)
            .toFormatter();

    private static final DateTimeFormatter FMT_SLASH_DATETIME = new DateTimeFormatterBuilder()
            .appendPattern("yyyy/MM/dd")
            .optionalStart().appendLiteral(' ').optionalEnd()
            .optionalStart().appendPattern("HH:mm").optionalEnd()
            .optionalStart().appendPattern(":ss").optionalEnd()
            .parseDefaulting(ChronoField.HOUR_OF_DAY, 0)
            .parseDefaulting(ChronoField.MINUTE_OF_HOUR, 0)
            .parseDefaulting(ChronoField.SECOND_OF_MINUTE, 0)
            .toFormatter();

    @Override
    public DisasterResponseVO getDisasterByRegion(String ctpvNm, String sggNm) {
        String requestRegionName = DisasterRegionMapper.buildRequestRegionName(ctpvNm, sggNm);
        LocalDateTime now = LocalDateTime.now(ZONE_ID);
        LocalDateTime threshold = now.minusHours(RECENT_HOURS);

        try {
            List<String> requestDates = buildRequestDates(now.toLocalDate());

            List<JsonNode> rawItems = new ArrayList<>();
            for (String crtDt : requestDates) {
                String apiUrl = buildApiUrl(crtDt, requestRegionName);

                log.debug("[DISASTER] requestRegionName={}", requestRegionName);
                log.debug("[DISASTER] crtDt={}", crtDt);
                log.debug("[DISASTER] apiUrl={}", apiUrl);

                String rawJson = restTemplate.getForObject(apiUrl, String.class);
                log.debug("[DISASTER] rawJson for {}={}", crtDt, rawJson);

                if (rawJson == null || rawJson.isBlank()) {
                    continue;
                }

                JsonNode root = objectMapper.readTree(rawJson);

                String resultCode = root.path("header").path("resultCode").asText("");
                String resultMsg = root.path("header").path("resultMsg").asText("");
                String errorMsg = root.path("header").path("errorMsg").asText("");

                log.debug("[DISASTER] resultCode={}, resultMsg={}, errorMsg={}", resultCode, resultMsg, errorMsg);

                if (!resultCode.isBlank() && !"00".equals(resultCode)) {
                    String failMessage = !errorMsg.isBlank() ? errorMsg : resultMsg;
                    log.warn("[DISASTER] API FAIL - crtDt={}, resultCode={}, failMessage={}",
                            crtDt, resultCode, failMessage);
                    continue;
                }

                rawItems.addAll(extractCandidateItems(root));
            }

            Map<String, DisasterItemVO> dedupMap = new LinkedHashMap<>();
            for (JsonNode item : rawItems) {
                DisasterItemVO vo = toItem(item, ctpvNm, sggNm, threshold, now);
                if (vo == null) {
                    continue;
                }

                String dedupKey = buildDedupKey(vo);
                dedupMap.putIfAbsent(dedupKey, vo);
            }

            List<DisasterItemVO> filtered = new ArrayList<>(dedupMap.values());
            filtered.sort(Comparator.comparing(this::extractSortDateTime).reversed());

            String summary = filtered.isEmpty()
                    ? requestRegionName + " 기준 최근 24시간 이내 여행 안전 관련 재난 문자가 없습니다."
                    : requestRegionName + " 기준 최근 24시간 이내 여행 안전 관련 재난 문자 " + filtered.size() + "건입니다.";

            return DisasterResponseVO.builder()
                    .success(true)
                    .ctpvNm(ctpvNm)
                    .sggNm(sggNm)
                    .requestRegionName(requestRegionName)
                    .summary(summary)
                    .items(filtered)
                    .build();

        } catch (Exception e) {
            log.error("[DISASTER] error={}", e.getMessage(), e);
            return emptyResponse(ctpvNm, sggNm, requestRegionName,
                    "재난 문자를 불러오는 중 오류가 발생했습니다.");
        }
    }

    /**
     * 오늘 + 어제 조회
     * 자정 직후에도 어제 늦은 밤 문자까지 포함하기 위함
     */
    private List<String> buildRequestDates(LocalDate today) {
        List<String> dates = new ArrayList<>();
        dates.add(today.format(DateTimeFormatter.BASIC_ISO_DATE));
        dates.add(today.minusDays(1).format(DateTimeFormatter.BASIC_ISO_DATE));
        return dates;
    }

    private String buildApiUrl(String crtDt, String requestRegionName) {
        StringBuilder urlBuilder = new StringBuilder(BASE_URL);
        urlBuilder.append("?serviceKey=").append(serviceKey);
        urlBuilder.append("&numOfRows=").append(NUM_OF_ROWS);
        urlBuilder.append("&pageNo=1");
        urlBuilder.append("&returnType=").append(encode(RETURN_TYPE));
        urlBuilder.append("&crtDt=").append(encode(crtDt));
        urlBuilder.append("&rgnNm=").append(encode(requestRegionName));
        return urlBuilder.toString();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private DisasterResponseVO emptyResponse(String ctpvNm, String sggNm, String requestRegionName, String summary) {
        return DisasterResponseVO.builder()
                .success(false)
                .ctpvNm(ctpvNm)
                .sggNm(sggNm)
                .requestRegionName(requestRegionName)
                .summary(summary)
                .items(List.of())
                .build();
    }

    /**
     * 구조가 유동적이므로 문자 항목처럼 보이는 object를 재귀 수집
     */
    private List<JsonNode> extractCandidateItems(JsonNode root) {
        List<JsonNode> result = new ArrayList<>();
        collectObjectNodes(root, result);
        return result;
    }

    private void collectObjectNodes(JsonNode node, List<JsonNode> result) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return;
        }

        if (node.isObject()) {
            boolean looksLikeItem = node.has("MSG_CN")
                    || node.has("RCPTN_RGN_NM")
                    || node.has("CRT_DT")
                    || node.has("DST_SE_NM")
                    || node.has("EMRG_STEP_NM");

            if (looksLikeItem) {
                result.add(node);
            }

            Iterator<JsonNode> fields = node.elements();
            while (fields.hasNext()) {
                collectObjectNodes(fields.next(), result);
            }
            return;
        }

        if (node.isArray()) {
            for (JsonNode child : node) {
                collectObjectNodes(child, result);
            }
        }
    }

    private DisasterItemVO toItem(JsonNode node,
            String ctpvNm,
            String sggNm,
            LocalDateTime threshold,
            LocalDateTime now) {

        String sn = text(node, "SN");
        String createdAt = text(node, "CRT_DT");
        String message = text(node, "MSG_CN");
        String regionName = text(node, "RCPTN_RGN_NM");
        String emergencyStep = text(node, "EMRG_STEP_NM");
        String disasterType = text(node, "DST_SE_NM");
        String regYmd = text(node, "REG_YMD");
        String modifiedYmd = text(node, "MDFCN_YMD");

        if (message.isBlank() && regionName.isBlank()) {
            return null;
        }

        String merged = safe(message) + " " + safe(regionName);
        if (!DisasterRegionMapper.matchesRegion(merged, ctpvNm, sggNm)) {
            return null;
        }

        LocalDateTime occurredAt = parseOccurredAt(createdAt, regYmd, modifiedYmd);
        if (occurredAt == null) {
            log.debug("[DISASTER] skip - datetime parse fail. createdAt={}, regYmd={}, modifiedYmd={}",
                    createdAt, regYmd, modifiedYmd);
            return null;
        }

        if (occurredAt.isBefore(threshold) || occurredAt.isAfter(now.plusMinutes(10))) {
            return null;
        }

        if (!isRelevantForTravel(message, disasterType, emergencyStep)) {
            return null;
        }

        String title = buildTitle(disasterType, emergencyStep, message);

        return DisasterItemVO.builder()
                .sn(sn)
                .ctpvNm(ctpvNm)
                .sggNm(sggNm)
                .title(title)
                .message(message)
                .regionName(regionName)
                .emergencyStep(emergencyStep)
                .disasterType(disasterType)
                .createdAt(createdAt)
                .regYmd(regYmd)
                .modifiedYmd(modifiedYmd)
                .build();
    }

    private boolean isRelevantForTravel(String message, String disasterType, String emergencyStep) {
        String text = normalize(safe(disasterType) + " " + safe(emergencyStep) + " " + safe(message));

        // 1) 먼저 제외
        String[] excludeKeywords = {
                "훈련", "테스트", "시험발송", "시범", "모의",
                "홍보", "캠페인", "행사", "축제", "점검안내",
                "마스크", "방역수칙", "손씻기", "예방수칙",
                "선거", "투표", "행정안내", "정책안내"
        };

        for (String keyword : excludeKeywords) {
            if (text.contains(keyword)) {
                return false;
            }
        }

        // 2) 여행·이동·현장 안전 관련 포함
        String[] includeKeywords = {
                // 기상 / 자연재난
                "호우", "폭우", "대설", "폭설", "태풍", "강풍", "풍랑",
                "폭염", "한파", "지진", "여진", "해일", "쓰나미",
                "산불", "산사태", "낙석", "침수", "붕괴",

                // 이동 / 통제 / 대피
                "대피", "대피명령", "대피권고",
                "통제", "교통통제", "도로통제", "출입통제", "접근금지", "우회",
                "고립", "범람", "월파", "유실", "결빙",

                // 여행 현장
                "하천", "계곡", "둔치", "저지대", "산지", "등산로",
                "해안", "해수욕장", "갯바위", "방파제", "선착장",
                "캠핑장", "야영장", "관광지", "여객선", "공항", "항공편"
        };

        for (String keyword : includeKeywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }

        // 3) 분류값만으로도 통과시킬 유형
        String typeText = normalize(safe(disasterType));
        String[] disasterTypes = {
                "호우", "대설", "태풍", "강풍", "풍랑",
                "폭염", "한파", "지진", "산불", "산사태",
                "해일", "침수", "붕괴"
        };

        for (String keyword : disasterTypes) {
            if (typeText.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private String buildTitle(String disasterType, String emergencyStep, String message) {
        String type = safe(disasterType).trim();
        String step = safe(emergencyStep).trim();

        if (!type.isBlank() && !step.isBlank()) {
            return type + " / " + step;
        }
        if (!type.isBlank()) {
            return type;
        }
        if (!step.isBlank()) {
            return step;
        }

        String text = normalize(message);
        if (text.contains("호우") || text.contains("폭우"))
            return "호우 재난문자";
        if (text.contains("대설") || text.contains("폭설"))
            return "대설 재난문자";
        if (text.contains("태풍"))
            return "태풍 재난문자";
        if (text.contains("강풍"))
            return "강풍 재난문자";
        if (text.contains("풍랑"))
            return "풍랑 재난문자";
        if (text.contains("폭염"))
            return "폭염 재난문자";
        if (text.contains("한파"))
            return "한파 재난문자";
        if (text.contains("지진"))
            return "지진 재난문자";
        if (text.contains("산불"))
            return "산불 재난문자";
        if (text.contains("산사태"))
            return "산사태 재난문자";
        if (text.contains("대피"))
            return "대피 안내";
        if (text.contains("통제"))
            return "통제 안내";

        return "여행안전 재난문자";
    }

    private String buildDedupKey(DisasterItemVO vo) {
        if (vo.getSn() != null && !vo.getSn().isBlank()) {
            return "SN:" + vo.getSn();
        }

        return "MSG:"
                + safe(vo.getCreatedAt()) + "|"
                + safe(vo.getRegionName()) + "|"
                + safe(vo.getMessage());
    }

    private LocalDateTime extractSortDateTime(DisasterItemVO vo) {
        LocalDateTime parsed = parseOccurredAt(vo.getCreatedAt(), vo.getRegYmd(), vo.getModifiedYmd());
        return parsed != null ? parsed : LocalDateTime.MIN;
    }

    private LocalDateTime parseOccurredAt(String createdAt, String regYmd, String modifiedYmd) {
        LocalDateTime dt = parseDateTime(createdAt);
        if (dt != null) {
            return dt;
        }

        LocalDateTime reg = parseDateTime(regYmd);
        if (reg != null) {
            return reg;
        }

        return parseDateTime(modifiedYmd);
    }

    private LocalDateTime parseDateTime(String raw) {
        String value = safe(raw).trim();
        if (value.isBlank()) {
            return null;
        }

        String digits = value.replaceAll("[^0-9]", "");

        try {
            if (digits.length() >= 14) {
                return LocalDateTime.parse(digits.substring(0, 14), FMT_YYYYMMDD_HHMMSS);
            }
        } catch (DateTimeParseException ignored) {
        }

        try {
            if (digits.length() == 12) {
                return LocalDateTime.parse(digits, FMT_YYYYMMDD_HHMM);
            }
        } catch (DateTimeParseException ignored) {
        }

        try {
            if (digits.length() == 8) {
                return LocalDate.parse(digits, FMT_YYYYMMDD).atStartOfDay();
            }
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value, FMT_DASH_DATETIME);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value, FMT_SLASH_DATETIME);
        } catch (DateTimeParseException ignored) {
        }

        return null;
    }

    private String text(JsonNode node, String fieldName) {
        JsonNode value = node.get(fieldName);
        return value == null || value.isNull() ? "" : value.asText("");
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String normalize(String value) {
        return safe(value)
                .replace("\n", " ")
                .replace("\r", " ")
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase();
    }
}