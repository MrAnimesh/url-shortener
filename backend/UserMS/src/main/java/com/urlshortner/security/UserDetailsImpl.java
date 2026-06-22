package com.urlshortner.security;

import com.urlshortner.entity.Users;
import com.urlshortner.enums.Subscription;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.ArrayList;
import java.util.List;

public class UserDetailsImpl implements UserDetails{
	
	private static final long serialVersionUID = 1L;
//	private final Users user;
	
	private Long id;
	private String email;
	private String password;
    private Collection<? extends GrantedAuthority> authorities;
	private Subscription sub_type;
	private Long ownerId;
	private String role;
	private List<String> permissions;
	private boolean enabled;
	

	public UserDetailsImpl(Users user) {
		this.email = user.getEmail();
		this.password = user.getPassword();
		List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
		grantedAuthorities.add(new SimpleGrantedAuthority(user.getRole().name()));
		this.permissions = user.getUserPermissions().stream()
				.map(userPermission -> userPermission.getPermission().getName().name())
				.sorted()
				.toList();
		this.permissions.forEach(permission -> grantedAuthorities.add(new SimpleGrantedAuthority(permission)));
		this.authorities = grantedAuthorities;
		this.id = user.getId();
		this.ownerId = user.getCreatedBy() == null ? user.getId() : user.getCreatedBy().getId();
		this.sub_type = user.getCreatedBy() == null ? user.getSubscription() : user.getCreatedBy().getSubscription();
		this.role = user.getRole().name();
		this.enabled = user.isEnabled();
		
	}
	
	

	public Long getId() {
		return id;
	}

	public Subscription getSub_type(){
		return this.sub_type;
	}

	public Long getOwnerId() {
		return ownerId;
	}

	public String getRole() {
		return role;
	}

	public List<String> getPermissions() {
		return permissions;
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
		return enabled;
	}

}
