package com.pcwk.ehr.trip;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripMapper tripMapper;

    @Override
    public List<TripVO> doRetrieve(DTO param) {
        return tripMapper.doRetrieve(param);
    }

    @Override
    public TripVO doSelectOne(TripVO param) {
        return tripMapper.doSelectOne(param);
    }

    @Override
    public int doSave(TripVO param) {
        throw new UnsupportedOperationException(); // 사용하지않는 메서드 예외처리
    }

    @Override
    public int doUpdate(TripVO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doDelete(TripVO param) {
        throw new UnsupportedOperationException();
    }

    @Override // 인터페이스에 정의된 메서드임을 명시
    public TripVO upDoSelectOne(TripVO param) {
        // 1. 조회 count 증가
        tripMapper.updateReadCnt(param);

        // 2. 단건 조회 (resultMap에 의해 imageList 4개가 채워진 상태)
        TripVO tripVO = tripMapper.doSelectOne(param);

        return tripVO;
    }

    @Override
    public List<String> getDistinctTags() {
        return tripMapper.getDistinctTags();
    }

}
