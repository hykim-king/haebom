package com.pcwk.ehr.trip;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripDetailVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripDetailServiceImpl implements TripDetailService {

    private final TripDetailMapper tripDetailMapper;

    @Override
    public List<TripDetailVO> doRetrieve(DTO param) {
        return tripDetailMapper.doRetrieve(param);
    }

    @Override
    public TripDetailVO doSelectOne(TripDetailVO param) {
        return tripDetailMapper.doSelectOne(param); 
    }

    @Override
    public int doSave(TripDetailVO param) {
        throw new UnsupportedOperationException(); // 사용하지않는 메서드 예외처리
    }

    @Override
    public int doUpdate(TripDetailVO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doDelete(TripDetailVO param) {
        throw new UnsupportedOperationException();
    }   

}
