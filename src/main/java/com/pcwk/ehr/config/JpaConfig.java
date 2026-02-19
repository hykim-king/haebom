/**
 * 
 */
package com.pcwk.ehr.config;

import java.util.Properties;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

/**
 * <pre>
 * Class Name : JpaConfig
 * Description :
 *
 * Modification Information
 * 수정일        수정자     수정내용
 * ----------  --------  ---------------------------
 * 2026. 2. 11.  user   최초 생성
 * </pre>
 *
 * @author user
 * @since 2026. 2. 11.
 */
@Configuration
@EnableJpaRepositories(
		//QuestionRespotiry, AnswerRespotiry
		basePackages = "com.pcwk.ehr.user.repository"
)
@EnableTransactionManagement
public class JpaConfig {

	
	
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            DataSource dataSource) {

        LocalContainerEntityManagerFactoryBean emf =
                new LocalContainerEntityManagerFactoryBean();

        emf.setDataSource(dataSource);
        //Entity: Question,Answer
        emf.setPackagesToScan("com.pcwk.ehr.user");

        JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        emf.setJpaVendorAdapter(vendorAdapter);

        Properties props = new Properties();
        props.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
        props.put("hibernate.show_sql", "true");
        props.put("hibernate.format_sql", "true");
        props.put("hibernate.hbm2ddl.auto", "update");

        emf.setJpaProperties(props);

        return emf;
    }	
	
	
	
	@Bean
	public PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
	
		return new JpaTransactionManager(emf);
	}
	
}
