package com.pcwk.ehr.relation;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.RelationVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface RelationMapper extends WorkDiv<RelationVO> {

    List<RelationVO> getListByUser(RelationVO param);

    List<RelationVO> getAll();

    int FavoriteStatus(RelationVO vo);

    int VisitedStatus(RelationVO vo);

    int getCount();

    int deleteAll();
}
