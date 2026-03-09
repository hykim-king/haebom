package com.pcwk.ehr.util.disaster;

import java.util.HashMap;
import java.util.Map;

public class DisasterRegionMapper {

    private static final Map<String, String> CTPV_FULL_NAME = new HashMap<>();

    static {
        CTPV_FULL_NAME.put("서울", "서울특별시");
        CTPV_FULL_NAME.put("부산", "부산광역시");
        CTPV_FULL_NAME.put("대구", "대구광역시");
        CTPV_FULL_NAME.put("인천", "인천광역시");
        CTPV_FULL_NAME.put("광주", "광주광역시");
        CTPV_FULL_NAME.put("대전", "대전광역시");
        CTPV_FULL_NAME.put("울산", "울산광역시");
        CTPV_FULL_NAME.put("세종", "세종특별자치시");
        CTPV_FULL_NAME.put("경기", "경기도");
        CTPV_FULL_NAME.put("강원", "강원특별자치도");
        CTPV_FULL_NAME.put("충북", "충청북도");
        CTPV_FULL_NAME.put("충남", "충청남도");
        CTPV_FULL_NAME.put("전북", "전북특별자치도");
        CTPV_FULL_NAME.put("전남", "전라남도");
        CTPV_FULL_NAME.put("경북", "경상북도");
        CTPV_FULL_NAME.put("경남", "경상남도");
        CTPV_FULL_NAME.put("제주", "제주특별자치도");
    }

    private DisasterRegionMapper() {
    }

    public static String toFullCtpvName(String ctpvNm) {
        if (ctpvNm == null || ctpvNm.isBlank())
            return "";
        return CTPV_FULL_NAME.getOrDefault(ctpvNm.trim(), ctpvNm.trim());
    }

    public static String buildRequestRegionName(String ctpvNm, String sggNm) {
        String fullCtpv = toFullCtpvName(ctpvNm);
        String sub = sggNm == null ? "" : sggNm.trim();

        if (sub.isBlank() || "전체".equals(sub)) {
            return fullCtpv;
        }
        return fullCtpv + " " + sub;
    }

    public static boolean matchesRegion(String regionText, String ctpvNm, String sggNm) {
        if (regionText == null || regionText.isBlank())
            return false;

        String normalizedText = normalize(regionText);
        String normalizedCtpv = normalize(toFullCtpvName(ctpvNm));
        String normalizedSgg = normalize(sggNm);

        boolean cityMatch = normalizedText.contains(normalizedCtpv);
        boolean districtMatch = normalizedSgg.isBlank()
                || "전체".equals(sggNm)
                || normalizedText.contains(normalizedSgg);

        return cityMatch && districtMatch;
    }

    public static String normalize(String value) {
        if (value == null)
            return "";
        return value.replaceAll("\\s+", "").trim();
    }
}