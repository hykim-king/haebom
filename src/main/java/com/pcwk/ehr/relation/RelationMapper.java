package com.pcwk.ehr.relation;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.RelationVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RelationMapper extends WorkDiv<RelationVO> {

    List<RelationVO> getListByUser(RelationVO param);

    List<RelationVO> getAll();

    int FavoriteStatus(RelationVO vo);

    int VisitedStatus(RelationVO vo);

    int getCount(@Param("tripContsId") int tripContsId);

    int deleteAll();

    int deleteFavorite(RelationVO vo);

    // [추가] 마이페이지 내 찜 개수 조회
    int getCountByUser(RelationVO vo);

    // [추가] 마이페이지 내 찜 목록 전체 삭제
    int deleteAllByUser(RelationVO vo);

    int existsFavorite(RelationVO vo);
}
