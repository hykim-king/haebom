package com.pcwk.ehr.main;

import com.pcwk.ehr.trip.TripMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MainServiceImpl implements MainService{

    private final TripMapper tripMapper;
}
