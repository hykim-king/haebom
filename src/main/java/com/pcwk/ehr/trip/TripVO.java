package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class TripVO extends TripDTO {
    private int tripId;
    private String tripName;
    private String tripImg;
    private String tripAdd;
    private double tripMapx;
    private double tripMapy;
    private String tripTag;
    private int tripType;
    private int tripSido;
    private int tripGungu;
    private int tripViewcnt;
    private int tripContent;
}