package com.pcwk.ehr.relation;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.RelationVO;
import java.util.List;

public interface RelationService extends WorkDiv<RelationVO> {
    // 여행지 상세 관련
    int FavoriteStatus(RelationVO vo);

    int getCount(int tripContsId);

    int deleteFavorite(RelationVO vo);

    int toggleFavorite(RelationVO vo);

    int existsFavorite(RelationVO vo);

    // =========================
    // 여행코스 찜 관련 (추가)
    // =========================
    int favoriteCourse(RelationVO vo);

    int getCourseCount(int courseNo);

    int deleteCourseFavorite(RelationVO vo);

    int toggleCourseFavorite(RelationVO vo);

    int existsCourseFavorite(RelationVO vo);

    // 마이페이지 관련
    int VisitedStatus(RelationVO vo);

    int getCountByUser(RelationVO vo);

    int deleteAllByUser(RelationVO vo);

    List<RelationVO> getAll();
}