package com.pcwk.ehr.relation;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.RelationVO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RelationServiceImpl implements RelationService {

    @Override
    public List<RelationVO> doRetrieve(DTO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public RelationVO doSelectOne(RelationVO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doSave(RelationVO param) {
        throw new UnsupportedOperationException(); // 사용하지않는 메서드 예외처리
    }

    @Override
    public int doUpdate(RelationVO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doDelete(RelationVO param) {
        throw new UnsupportedOperationException();
    }

    @Autowired
    private RelationMapper relationMapper;

    @Override
    public int existsFavorite(RelationVO vo) {
        return relationMapper.existsFavorite(vo);
    }

    @Override
    public int FavoriteStatus(RelationVO vo) {
        return relationMapper.FavoriteStatus(vo);
    }

    @Override
    public int getCount(int tripContsId) {
        return relationMapper.getCount(tripContsId);
    }

    @Override
    public int deleteFavorite(RelationVO vo) {
        return relationMapper.deleteFavorite(vo);
    }

    @Override
    public int VisitedStatus(RelationVO vo) {
        return relationMapper.VisitedStatus(vo);
    }

    @Override
    public int getCountByUser(RelationVO vo) {
        return relationMapper.getCountByUser(vo);
    }

    @Override
    public int deleteAllByUser(RelationVO vo) {
        return relationMapper.deleteAllByUser(vo);
    }

    @Override
    public List<RelationVO> getAll() {
        return relationMapper.getAll();
    }

    @Override
    public int toggleFavorite(RelationVO vo) {
        // 1. 모든 조건을 먼저 세팅 (조회와 삽입/삭제에 동일하게 적용되도록)
        vo.setRelClsf(10);
        vo.setCourseNo(null);

        // 2. 세팅된 조건(userNo, tripContsId, relClsf)으로 존재 여부 확인
        int exists = relationMapper.existsFavorite(vo);

        if (exists > 0) {
            // 3. 존재하면 삭제
            return relationMapper.deleteFavorite(vo);
        } else {
            // 4. 없으면 추가
            return relationMapper.FavoriteStatus(vo);
        }
    }

}