package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.hospital.HospitalVO;

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
public class TripVO extends DTO {
	private int    trip_id;      
    private String trip_name;    
    private String trip_img;     
    private String trip_add;     
    private double trip_mapx;    
    private double trip_mapy;    
    private String trip_tag;     
    private int    trip_type;    
    private int    trip_viewcnt; 
    private int    trip_sido;    
    private int    trip_gungu;   

}
