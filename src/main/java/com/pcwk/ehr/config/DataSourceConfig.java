package com.pcwk.ehr.config;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.zaxxer.hikari.HikariDataSource;

//@Bean을 1개 이상 포함 가능
@Configuration
public class DataSourceConfig {
	
	@Bean
	public DataSource dataSource() {
		HikariDataSource ds=new HikariDataSource();
		ds.setDriverClassName("oracle.jdbc.driver.OracleDriver");
		ds.setJdbcUrl("jdbc:oracle:thin:@192.168.100.30:1522:xe");
		//내부 192.168.100.30
		ds.setUsername("habom");
		ds.setPassword("0317");
		
		return ds;
	}
	
}
