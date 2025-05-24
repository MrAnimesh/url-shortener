package com.urlshortner.security;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.urlshortner.entity.Users;

public class UserDetailsImpl implements UserDetails{
	
	private static final long serialVersionUID = 1L;
//	private final Users user;
	
	private Long id;
	private String email;
	private String password;
    private Collection<? extends GrantedAuthority> authorities;
	

	public UserDetailsImpl(Users user) {
		this.email = user.getEmail();
		this.password = user.getPassword();
		this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));
		this.id = user.getId();
		
	}
	
	

	public Long getId() {
		return id;
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
