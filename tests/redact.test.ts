import { describe, it, expect } from 'vitest';
import { redactText } from '../src/lib/redact';

describe('redact.ts - Sensitive Data Redaction', () => {
  describe('API Keys and Tokens', () => {
    it('should redact API keys', () => {
      const text = 'API_KEY=sk-1234567890abcdef and another api_key="xyz123456"';
      const result = redactText(text);
      
      expect(result).not.toContain('sk-1234567890abcdef');
      expect(result).not.toContain('xyz123456');
      expect(result).toContain('[REDACTED]');
    });
    
    it('should redact Bearer tokens', () => {
      const text = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
      const result = redactText(text);
      
      expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(result).toContain('Bearer [REDACTED]');
    });
    
    it('should redact GitHub tokens', () => {
      const text = 'github_token: ghp_1234567890abcdefghijklmnopqrstuvwxyz';
      const result = redactText(text);
      
      expect(result).not.toContain('ghp_1234567890abcdefghijklmnopqrstuvwxyz');
      expect(result).toContain('[REDACTED]');
    });
    
    it('should redact npm tokens', () => {
      const text = 'npm_token=npm_abcdef123456789';
      const result = redactText(text);
      
      expect(result).not.toContain('npm_abcdef123456789');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('Passwords and Secrets', () => {
    it('should redact passwords', () => {
      const text = 'password: MySecretPass123! and PASSWORD="AnotherSecret"';
      const result = redactText(text);
      
      expect(result).not.toContain('MySecretPass123');
      expect(result).not.toContain('AnotherSecret');
      expect(result).toContain('[REDACTED]');
    });
    
    it('should redact secrets', () => {
      const text = 'secret: SuperSecretValue123 and CLIENT_SECRET=xyz789';
      const result = redactText(text);
      
      expect(result).not.toContain('SuperSecretValue123');
      expect(result).not.toContain('xyz789');
      expect(result).toContain('[REDACTED]');
    });
    
    it('should redact private keys', () => {
      const text = 'private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq..."';
      const result = redactText(text);
      
      expect(result).not.toContain('BEGIN PRIVATE KEY');
      expect(result).not.toContain('MIIEvgIBADANBgkq');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('Environment Variables', () => {
    it('should redact common sensitive environment variables', () => {
      const text = `
        DATABASE_URL=postgresql://user:pass@localhost/db
        REDIS_URL=redis://user:pass@localhost:6379
        MONGODB_URI=mongodb://user:pass@localhost:27017/db
      `;
      const result = redactText(text);
      
      expect(result).not.toContain('user:pass');
      expect(result).not.toContain('postgresql://');
      expect(result).not.toContain('redis://');
      expect(result).not.toContain('mongodb://');
      expect(result).toContain('[REDACTED]');
    });
    
    it('should redact AWS credentials', () => {
      const text = `
        AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
        AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
      `;
      const result = redactText(text);
      
      expect(result).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(result).not.toContain('wJalrXUtnFEMI/K7MDENG');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('URLs with Credentials', () => {
    it('should redact credentials in URLs', () => {
      const text = 'https://username:password@example.com/path';
      const result = redactText(text);
      
      expect(result).not.toContain('username:password');
      expect(result).toContain('https://[REDACTED]@example.com/path');
    });
    
    it('should redact Git URLs with tokens', () => {
      const text = 'https://oauth2:github_token_here@github.com/user/repo.git';
      const result = redactText(text);
      
      expect(result).not.toContain('github_token_here');
      expect(result).not.toContain('oauth2');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('Credit Card Numbers', () => {
    it('should redact credit card numbers', () => {
      const text = 'Card: 4111-1111-1111-1111 or 5500000000000004';
      const result = redactText(text);
      
      expect(result).not.toContain('4111-1111-1111-1111');
      expect(result).not.toContain('5500000000000004');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('SSH Keys', () => {
    it('should redact SSH private keys', () => {
      const text = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----';
      const result = redactText(text);
      
      expect(result).not.toContain('BEGIN RSA PRIVATE KEY');
      expect(result).not.toContain('MIIEowIBAAKCAQEA');
      expect(result).toContain('[REDACTED]');
    });
    
    it('should redact SSH public keys if needed', () => {
      const text = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@host';
      const result = redactText(text);
      
      // Public keys might be okay to keep, but if treating as sensitive:
      expect(result).not.toContain('AAAAB3NzaC1yc2EAAAADAQABAAABgQC');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('JSON Web Tokens', () => {
    it('should redact JWTs', () => {
      const text = 'token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = redactText(text);
      
      expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const result = redactText('');
      expect(result).toBe('');
    });
    
    it('should handle null/undefined gracefully', () => {
      const result1 = redactText(null as any);
      const result2 = redactText(undefined as any);
      
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
    
    it('should handle text with no sensitive data', () => {
      const text = 'This is just regular text with no sensitive information.';
      const result = redactText(text);
      
      expect(result).toBe(text);
    });
    
    it('should handle multiple sensitive items in one line', () => {
      const text = 'API_KEY=secret1 PASSWORD=secret2 TOKEN=secret3';
      const result = redactText(text);
      
      expect(result).not.toContain('secret1');
      expect(result).not.toContain('secret2');
      expect(result).not.toContain('secret3');
      expect(result.match(/\[REDACTED\]/g)?.length).toBeGreaterThanOrEqual(3);
    });
    
    it('should preserve non-sensitive context', () => {
      const text = 'Error occurred while connecting with API_KEY=secret123 to server';
      const result = redactText(text);
      
      expect(result).toContain('Error occurred while connecting');
      expect(result).toContain('to server');
      expect(result).not.toContain('secret123');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('Custom Patterns', () => {
    it('should redact custom secret patterns', () => {
      const text = 'CUSTOM_SECRET=abc123xyz and MY_API_TOKEN=def456uvw';
      const result = redactText(text);
      
      expect(result).not.toContain('abc123xyz');
      expect(result).not.toContain('def456uvw');
      expect(result).toContain('[REDACTED]');
    });
    
    it('should redact base64 encoded secrets', () => {
      const text = 'auth: Basic YWRtaW46cGFzc3dvcmQ=';
      const result = redactText(text);
      
      expect(result).not.toContain('YWRtaW46cGFzc3dvcmQ=');
      expect(result).toContain('[REDACTED]');
    });
  });
  
  describe('Performance', () => {
    it('should handle large text efficiently', () => {
      const largeText = 'Normal text '.repeat(1000) + 'API_KEY=secret123 ' + 'More text '.repeat(1000);
      const startTime = Date.now();
      const result = redactText(largeText);
      const duration = Date.now() - startTime;
      
      expect(result).not.toContain('secret123');
      expect(result).toContain('[REDACTED]');
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });
});