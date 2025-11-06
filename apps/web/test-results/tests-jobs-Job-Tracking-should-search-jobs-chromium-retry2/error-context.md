# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - img [ref=e6]
    - heading "404" [level=1] [ref=e9]
    - heading "Page Not Found" [level=2] [ref=e10]
    - paragraph [ref=e11]: The page you're looking for doesn't exist or has been moved.
    - generic [ref=e12]:
      - link "Go Home" [ref=e13] [cursor=pointer]:
        - /url: /
        - img [ref=e14]
        - text: Go Home
      - button "Go Back" [ref=e17] [cursor=pointer]:
        - img [ref=e18]
        - text: Go Back
    - generic [ref=e20]:
      - paragraph [ref=e21]: "Common pages:"
      - generic [ref=e22]:
        - link "Dashboard" [ref=e23] [cursor=pointer]:
          - /url: /dashboard
        - link "Landing" [ref=e24] [cursor=pointer]:
          - /url: /landing
        - link "Login" [ref=e25] [cursor=pointer]:
          - /url: /login
  - alert [ref=e26]
```