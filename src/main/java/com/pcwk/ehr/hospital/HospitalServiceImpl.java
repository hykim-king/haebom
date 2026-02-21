package com.pcwk.ehr.hospital;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.HospitalVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HospitalServiceImpl implements HospitalService {

    private final HospitalMapper hospitalMapper;

    @Override
    public List<HospitalVO> doRetrieve(DTO param) {
        return hospitalMapper.doRetrieve(param);
    }

    @Override
    public HospitalVO doSelectOne(HospitalVO param) {
        return hospitalMapper.doSelectOne(param); 
    }

    @Override
    public int doSave(HospitalVO param) {
        throw new UnsupportedOperationException(); // 사용하지않는 메서드 예외처리
    }

    @Override
    public int doUpdate(HospitalVO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doDelete(HospitalVO param) {
        throw new UnsupportedOperationException();
    }   






}
