package com.pcwk.ehr.main;

import com.pcwk.ehr.trip.TripMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("mainService")
public class MainServiceImpl implements MainService{

    @Autowired
    private final TripMapper tripMapper;
}
