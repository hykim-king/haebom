package com.pcwk.ehr.drug;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.DrugVO;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class DrugSerivceImpl implements DrugService {

    private final DrugMapper drugMapper;

    @Override
    public List<DrugVO> doRetrieve(DTO param) {
        return drugMapper.doRetrieve(param);
    }

    @Override
    public DrugVO doSelectOne(DrugVO param) {
        return drugMapper.doSelectOne(param); 
    }

    @Override
    public int doSave(DrugVO param) {
        throw new UnsupportedOperationException(); // 사용하지않는 메서드 예외처리
    }

    @Override
    public int doUpdate(DrugVO param) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doDelete(DrugVO param) {
        throw new UnsupportedOperationException();
    }   



}