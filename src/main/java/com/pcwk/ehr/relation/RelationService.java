package com.pcwk.ehr.relation;


import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.RelationVO;
import java.util.List;

public interface RelationService extends WorkDiv<RelationVO>  {
    // 여행지 상세 관련
    int FavoriteStatus(RelationVO vo);
    int getCount(int tripContsId);
    int deleteFavorite(RelationVO vo);

    // 마이페이지 관련
    int VisitedStatus(RelationVO vo);
    int getCountByUser(RelationVO vo);
    int deleteAllByUser(RelationVO vo);
    List<RelationVO> getAll();
}