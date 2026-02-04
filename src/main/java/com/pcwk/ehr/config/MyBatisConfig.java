package com.pcwk.ehr.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.pcwk.ehr.mapper")
public class MyBatisConfig {

	@Bean
	public SqlSessionFactory sqlSessionFactoryBean(DataSource ds,ApplicationContext applicationContext) throws Exception {
		SqlSessionFactoryBean factory = new SqlSessionFactoryBean();

		factory.setDataSource(ds);
		
		//Mybatis Configuration 설정
		org.apache.ibatis.session.Configuration
		mybatisConfig =new org.apache.ibatis.session.Configuration();
		//mybatis.configuration.map-underscore-to-camel-case=true    
		mybatisConfig.setMapUnderscoreToCamelCase(true);
		factory.setConfiguration(mybatisConfig);
		
		
        // ⭐ Mapper XML 위치 설정
        factory.setMapperLocations(
            applicationContext.getResources("classpath:mapper/*.xml")
        );
        //alias
        factory.setTypeAliasesPackage("com.pcwk.ehr.domain");
        
        
		return factory.getObject();

	}
	
	@Bean
	public SqlSessionTemplate  sqlSessionTemplate(SqlSessionFactory sf) {
		return new SqlSessionTemplate(sf);
	}
	
}
