package com.pcwk.ehr.relation;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.RelationVO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RelationServiceImpl implements RelationService {

    @Autowired
    private RelationMapper relationMapper;

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
        throw new UnsupportedOperationException();
    }

    @Override
    public int doUpdate(RelationVO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doDelete(RelationVO param) {
        throw new UnsupportedOperationException();
    }

    // =========================
    // 여행지 찜 관련
    // =========================
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
    public int toggleFavorite(RelationVO vo) {
        vo.setRelClsf(10);
        vo.setCourseNo(null);

        int exists = relationMapper.existsFavorite(vo);

        if (exists > 0) {
            return relationMapper.deleteFavorite(vo);
        } else {
            return relationMapper.FavoriteStatus(vo);
        }
    }

    // =========================
    // 여행코스 찜 관련 (추가)
    // =========================
    @Override
    public int existsCourseFavorite(RelationVO vo) {
        return relationMapper.existsCourseFavorite(vo);
    }

    @Override
    public int favoriteCourse(RelationVO vo) {
        return relationMapper.favoriteCourse(vo);
    }

    @Override
    public int getCourseCount(int courseNo) {
        return relationMapper.getCourseCount(courseNo);
    }

    @Override
    public int deleteCourseFavorite(RelationVO vo) {
        return relationMapper.deleteCourseFavorite(vo);
    }

    @Override
    public int toggleCourseFavorite(RelationVO vo) {
        vo.setRelClsf(10);
        vo.setTripContsId(null);

        int exists = relationMapper.existsCourseFavorite(vo);

        if (exists > 0) {
            return relationMapper.deleteCourseFavorite(vo);
        } else {
            return relationMapper.favoriteCourse(vo);
        }
    }

    // =========================
    // 마이페이지 관련
    // =========================
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