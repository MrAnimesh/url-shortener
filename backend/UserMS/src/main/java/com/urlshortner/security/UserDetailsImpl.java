package com.urlshortner.security;

import com.urlshortner.entity.Users;
import com.urlshortner.enums.Subscription;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails{
	
	private static final long serialVersionUID = 1L;
//	private final Users user;
	
	private Long id;
	private String email;
	private String password;
    private Collection<? extends GrantedAuthority> authorities;
	private Subscription sub_type;
	

	public UserDetailsImpl(Users user) {
		this.email = user.getEmail();
		this.password = user.getPassword();
		this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));
		this.id = user.getId();
		this.sub_type = user.getSubscription();
		
	}
	
	

	public Long getId() {
		return id;
	}

	public Subscription getSub_type(){
		return this.sub_type;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return authorities;
	}

	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return password;
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return true;
	}

}
