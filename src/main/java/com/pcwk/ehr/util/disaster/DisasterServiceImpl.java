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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisasterServiceImpl implements DisasterService {

    private final Logger log = LogManager.getLogger(getClass());

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${disaster.api.service-key}")
    private String serviceKey;

    @Value("${disaster.api.base-url}")
    private String baseUrl;

    @Value("${disaster.api.return-type:json}")
    private String returnType;

    @Value("${disaster.api.num-of-rows:50}")
    private int numOfRows;

    @Override
    public DisasterResponseVO getDisasterByRegion(String ctpvNm, String sggNm) {
        String requestRegionName = DisasterRegionMapper.buildRequestRegionName(ctpvNm, sggNm);
        String crtDt = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);

        try {
            String apiUrl = buildApiUrl(crtDt, requestRegionName);

            log.debug("[DISASTER] baseUrl={}", baseUrl);
            log.debug("[DISASTER] serviceKey(first8)={}",
                    serviceKey != null && serviceKey.length() >= 8 ? serviceKey.substring(0, 8) : serviceKey);
            log.debug("[DISASTER] requestRegionName={}", requestRegionName);
            log.debug("[DISASTER] crtDt={}", crtDt);
            log.debug("[DISASTER] apiUrl={}", apiUrl);

            String rawJson = restTemplate.getForObject(apiUrl, String.class);
            log.debug("[DISASTER] rawJson={}", rawJson);

            if (rawJson == null || rawJson.isBlank()) {
                return emptyResponse(ctpvNm, sggNm, requestRegionName, "재난 데이터를 불러오지 못했습니다.");
            }

            JsonNode root = objectMapper.readTree(rawJson);

            String resultCode = root.path("header").path("resultCode").asText("");
            String resultMsg = root.path("header").path("resultMsg").asText("");
            String errorMsg = root.path("header").path("errorMsg").asText("");

            log.debug("[DISASTER] resultCode={}, resultMsg={}, errorMsg={}", resultCode, resultMsg, errorMsg);

            // 공식 API가 실패 응답을 body:null 로 주는 경우를 먼저 차단
            if (!resultCode.isBlank() && !"00".equals(resultCode)) {
                String failMessage = !errorMsg.isBlank() ? errorMsg : resultMsg;
                log.warn("[DISASTER] API FAIL - resultCode={}, failMessage={}", resultCode, failMessage);
                return emptyResponse(ctpvNm, sggNm, requestRegionName,
                        "재난 API 조회 실패: " + failMessage);
            }

            List<JsonNode> rawItems = extractCandidateItems(root);
            log.debug("[DISASTER] rawItems.size={}", rawItems.size());

            List<DisasterItemVO> filtered = new ArrayList<>();
            for (JsonNode item : rawItems) {
                DisasterItemVO vo = toItem(item, ctpvNm, sggNm);
                if (vo != null) {
                    filtered.add(vo);
                }
            }
            log.debug("[DISASTER] filtered.size={}", filtered.size());

            String summary = filtered.isEmpty()
                    ? requestRegionName + " 기준 현재 표시할 재난 문자가 없습니다."
                    : requestRegionName + " 기준 " + filtered.size() + "건의 재난 정보가 있습니다.";

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
            return emptyResponse(ctpvNm, sggNm, requestRegionName, "특보 정보를 불러오는 중 오류가 발생했습니다.");
        }
    }

    private String buildApiUrl(String crtDt, String requestRegionName) {
        StringBuilder urlBuilder = new StringBuilder(baseUrl);
        urlBuilder.append("?serviceKey=").append(serviceKey);
        urlBuilder.append("&numOfRows=").append(numOfRows);
        urlBuilder.append("&pageNo=1");
        urlBuilder.append("&returnType=").append(encode(returnType));
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
     * JSON 최상위 구조가 확실하지 않으므로,
     * MSG_CN / RCPTN_RGN_NM / CRT_DT 같은 필드를 가진 object를 재귀적으로 수집한다.
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
            boolean looksLikeItem = node.has("MSG_CN") ||
                    node.has("RCPTN_RGN_NM") ||
                    node.has("CRT_DT") ||
                    node.has("DST_SE_NM") ||
                    node.has("EMRG_STEP_NM");

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

    private DisasterItemVO toItem(JsonNode node, String ctpvNm, String sggNm) {
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

        String merged = message + " " + regionName;

        if (!DisasterRegionMapper.matchesRegion(merged, ctpvNm, sggNm)) {
            return null;
        }

        String title = buildTitle(disasterType, emergencyStep);

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

    private String buildTitle(String disasterType, String emergencyStep) {
        String type = disasterType == null ? "" : disasterType.trim();
        String step = emergencyStep == null ? "" : emergencyStep.trim();

        if (!type.isBlank() && !step.isBlank()) {
            return type + " / " + step;
        }
        if (!type.isBlank()) {
            return type;
        }
        if (!step.isBlank()) {
            return step;
        }
        return "재난안전문자";
    }

    private String text(JsonNode node, String fieldName) {
        JsonNode value = node.get(fieldName);
        return value == null || value.isNull() ? "" : value.asText("");
    }
}