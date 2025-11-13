# 📚 RoleRabbit Documentation

**Version:** 1.0  
**Last Updated:** 2025-11-13

---

## 📁 Documentation Structure

This repository uses a three-tier documentation system to organize documents by their status and purpose.

### **1. 📋 Founder-Approved** (`founder-approved/`)

**Purpose:** Official, approved documentation  
**Access:** Read-only (except for founder)  
**Content:** Finalized system architecture, API docs, business requirements

👉 [View Founder-Approved Docs](./founder-approved/)

**Current Documents:**
- `RESUME-AI-SYSTEM.md` - Complete Resume AI System Architecture (v3.0)

---

### **2. 🔍 Cursor Tracking** (`cursor-tracking/`)

**Purpose:** Active development tracking and work-in-progress  
**Access:** Read/Write for development team  
**Content:** TODOs, bug tracking, feature development notes, session logs

👉 [View Cursor Tracking Docs](./cursor-tracking/)

**Categories:**
- TODO lists
- Bug reports and fixes
- Feature development notes
- Implementation plans
- Testing checklists
- Session summaries

---

### **3. 🚀 Production-Ready** (`production-ready/`)

**Purpose:** 100% complete, bug-free, production-deployed components  
**Access:** Read-only (except for founder approval)  
**Content:** Production deployment guides, operational runbooks, monitoring docs

👉 [View Production-Ready Docs](./production-ready/)

**Requirements for Entry:**
- ✅ 100% feature complete
- ✅ Bug-free (thoroughly tested)
- ✅ Founder approved
- ✅ Production deployed
- ✅ Documentation complete

---

## 📊 Document Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENT LIFECYCLE                        │
└─────────────────────────────────────────────────────────────┘

1. DRAFT CREATION
   ├─> Created in: cursor-tracking/
   ├─> Status: DRAFT, IN_PROGRESS
   └─> Audience: Development team

2. DEVELOPMENT & ITERATION
   ├─> Location: cursor-tracking/
   ├─> Status: REVIEW, TESTING
   └─> Activities: Code, test, document

3. FOUNDER REVIEW
   ├─> Moved to: founder-approved/
   ├─> Status: Pending Founder Review
   └─> Approval: Founder signs off

4. PRODUCTION DEPLOYMENT
   ├─> Moved to: production-ready/
   ├─> Status: Production Ready
   └─> Requirements: 100% complete, bug-free

5. MAINTENANCE
   ├─> Updates: Version-controlled
   ├─> Bug fixes: Back to cursor-tracking/
   └─> Deprecation: Marked clearly
```

---

## 🏷️ Document Status Tags

Use these tags in document filenames or headers:

### **Cursor Tracking:**
- `DRAFT` - Initial draft, under development
- `IN_PROGRESS` - Actively being worked on
- `REVIEW` - Ready for review
- `TESTING` - Under testing
- `FIXED` - Bug fixed, awaiting verification
- `COMPLETE` - Done, ready for approval
- `BLOCKED` - Blocked by dependencies
- `CANCELLED` - No longer needed

### **Founder Approved:**
- `Pending Founder Review` - Awaiting founder approval
- `Approved` - Founder approved
- `Revision Required` - Needs changes

### **Production Ready:**
- `Production Ready` - Deployed and stable
- `Deprecated` - Being phased out
- `Archived` - No longer in use

---

## 📝 Document Naming Convention

### **Cursor Tracking:**
```
[CATEGORY]-[DESCRIPTION]-[STATUS].md

Examples:
- TODO-resume-parser-improvements-IN_PROGRESS.md
- BUG-ats-scoring-cache-issue-FIXED.md
- FEATURE-diff-highlighting-DRAFT.md
```

### **Founder Approved:**
```
[COMPONENT]-[TYPE].md

Examples:
- RESUME-AI-SYSTEM.md
- API-DOCUMENTATION.md
- USER-GUIDE.md
```

### **Production Ready:**
```
[COMPONENT]/
├── README.md
├── ARCHITECTURE.md
├── API.md
├── DEPLOYMENT.md
├── MONITORING.md
├── TROUBLESHOOTING.md
└── CHANGELOG.md
```

---

## 🔄 Moving Documents Between Directories

### **Cursor Tracking → Founder Approved**

**Trigger:** Feature/component ready for review

**Steps:**
1. Ensure document is complete and well-formatted
2. Add "Pending Founder Review" status
3. Move to `founder-approved/`
4. Notify founder for review
5. Wait for approval

**Command:**
```bash
# Move document
mv docs/cursor-tracking/FEATURE-xyz-COMPLETE.md docs/founder-approved/XYZ-FEATURE.md

# Update status in document
# Status: Pending Founder Review
```

### **Founder Approved → Production Ready**

**Trigger:** Component deployed to production, 100% complete, bug-free

**Steps:**
1. Verify all production requirements met
2. Create component directory structure
3. Move/copy documentation
4. Update status to "Production Ready"
5. Add to production monitoring

**Command:**
```bash
# Create component directory
mkdir docs/production-ready/ComponentName

# Move documentation
cp docs/founder-approved/COMPONENT.md docs/production-ready/ComponentName/README.md

# Add additional docs
touch docs/production-ready/ComponentName/{DEPLOYMENT,MONITORING,TROUBLESHOOTING}.md
```

### **Production Ready → Cursor Tracking (Bug Found)**

**Trigger:** Bug discovered in production component

**Steps:**
1. Create bug report in cursor-tracking/
2. Mark production doc as "Under Maintenance"
3. Fix bug
4. Update documentation
5. Re-deploy and verify
6. Update production-ready/ docs

---

## 🛠️ Quick Start for Developers

### **Starting a New Feature:**

1. Create draft in `cursor-tracking/`:
   ```bash
   touch docs/cursor-tracking/FEATURE-my-feature-DRAFT.md
   ```

2. Document as you develop:
   - Implementation plan
   - Technical decisions
   - Testing notes
   - Known issues

3. Mark complete when done:
   ```bash
   mv docs/cursor-tracking/FEATURE-my-feature-DRAFT.md \
      docs/cursor-tracking/FEATURE-my-feature-COMPLETE.md
   ```

4. Request founder review:
   - Move to `founder-approved/`
   - Add "Pending Founder Review" status
   - Notify founder

### **Tracking a Bug:**

1. Create bug report:
   ```bash
   touch docs/cursor-tracking/BUG-description-IN_PROGRESS.md
   ```

2. Document:
   - Bug description
   - Reproduction steps
   - Root cause analysis
   - Fix implementation
   - Testing verification

3. Mark fixed:
   ```bash
   mv docs/cursor-tracking/BUG-description-IN_PROGRESS.md \
      docs/cursor-tracking/BUG-description-FIXED.md
   ```

---

## 📊 Current Documentation Status

### **Founder-Approved:** 1 document
- ✅ RESUME-AI-SYSTEM.md (v3.0) - Pending Review

### **Cursor-Tracking:** 0 documents
- (Ready for new development tracking)

### **Production-Ready:** 0 components
- (Awaiting founder approval and production deployment)

---

## 🤝 Contributing

### **For Developers:**
1. Create all new docs in `cursor-tracking/`
2. Use proper naming conventions
3. Update status tags as work progresses
4. Request founder review when complete

### **For Founder:**
1. Review documents in `founder-approved/` with "Pending Review" status
2. Approve or request revisions
3. Move to `production-ready/` when deployed and stable

---

## 📞 Questions?

- **Documentation Structure:** See individual README files in each directory
- **Document Status:** Check the status tag in the document header
- **Moving Documents:** Follow the lifecycle process above

---

**Maintained by:** RoleReady Development Team  
**Last Updated:** 2025-11-13

