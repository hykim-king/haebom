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
}