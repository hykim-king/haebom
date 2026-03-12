package com.pcwk.ehr.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.zaxxer.hikari.HikariDataSource;

//@Bean을 1개 이상 포함 가능
@Configuration
public class DataSourceConfig {

	@Value("${spring.datasource.driver-class-name}")
	private String driverClassName;

	@Value("${spring.datasource.url}")
	private String jdbcUrl;

	@Value("${spring.datasource.username}")
	private String username;

	@Value("${spring.datasource.password}")
	private String password;

	@Bean
	public DataSource dataSource() {
		HikariDataSource ds = new HikariDataSource();
<<<<<<< HEAD
		ds.setDriverClassName("oracle.jdbc.driver.OracleDriver");
		ds.setJdbcUrl("jdbc:oracle:thin:@192.168.100.30:1522:xe");
//		ds.setJdbcUrl("jdbc:oracle:thin:@218.144.130.138:1522:xe");
		ds.setUsername("habom");
		ds.setPassword("0317");
=======
		ds.setDriverClassName(driverClassName);
		ds.setJdbcUrl(jdbcUrl);
		ds.setUsername(username);
		ds.setPassword(password);
>>>>>>> 6b42e8f5a0cab4098e44b88272c2983c679bf0ff

		return ds;
	}

}
