import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FooterLink {
  label: string;
  url: string;
  icon?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  @Input() companyName = 'ECommerce Store';
  @Input() currentYear = new Date().getFullYear();
  @Input() footerLinks: FooterLink[] = [];
  @Input() socialLinks: SocialLink[] = [];
  
  constructor() {}

  ngOnInit(): void {
    // Initialize default data if not provided
    if (this.footerLinks.length === 0) {
      this.footerLinks = [
        { label: 'About Us', url: '/about' },
        { label: 'Contact', url: '/contact' },
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' }
      ];
    }
    
    if (this.socialLinks.length === 0) {
      this.socialLinks = [
        { name: 'Facebook', url: '#', icon: 'fab fa-facebook' },
        { name: 'Twitter', url: '#', icon: 'fab fa-twitter' },
        { name: 'Instagram', url: '#', icon: 'fab fa-instagram' },
        { name: 'LinkedIn', url: '#', icon: 'fab fa-linkedin' }
      ];
    }
  }
}
