import type { DemoDepartment, DemoMember } from "../types/workspace-settings"

const teams = [
  ["product", "产品管理部", "dept-root", "Shen", 48],
  ["design", "体验设计部", "dept-root", "Xu", 32],
  ["data", "数据分析部", "dept-root", "Gu", 40],
  ["customers", "客户成功部", "dept-root", "Lu", 24],
  ["support", "技术支持部", "dept-root", "Tang", 28],
  ["sales", "销售运营部", "dept-root", "He", 22],
  ["marketing", "品牌市场部", "dept-root", "Gao", 30],
  ["people", "人才与组织部", "dept-root", "Qiao", 18],
  ["procurement", "采购管理部", "dept-root", "Zheng", 26],
  ["legal", "法务事务部", "dept-root", "Lin", 16],
  ["quality", "质量工程组", "dept-rd", "Han", 20],
  ["reliability", "站点可靠性组", "dept-platform", "Song", 38],
] as const

const names = ["Avery", "Jordan", "Morgan", "Riley", "Taylor"]

export const additionalDemoDepartments: DemoDepartment[] = teams.map(
  ([key, name, parentId, surname, budget], index) => ({
    id: `dept-demo-${key}`,
    name,
    parentId,
    leader: `${names[0]} ${surname}`,
    costCenter: `CC-${501 + index}`,
    monthlyBudgetWan: budget,
  })
)

export const additionalDemoMembers: DemoMember[] = teams.flatMap(
  ([key, , , surname], teamIndex) =>
    names.map((givenName, memberIndex) => {
      const invited = memberIndex === 4 && teamIndex % 2 === 0
      return {
        id: `mem-demo-${key}-${memberIndex + 1}`,
        name: `${givenName} ${surname}`,
        initials: `${givenName[0]}${surname[0]}`,
        email: `${givenName}.${surname}@aries.example`.toLowerCase(),
        departmentId: `dept-demo-${key}`,
        roleId:
          memberIndex === 0
            ? "role-finance"
            : memberIndex < 3
              ? "role-analyst"
              : "role-viewer",
        status: invited
          ? "invited"
          : memberIndex === 4 && teamIndex % 3 === 0
            ? "disabled"
            : "active",
        twoFactorEnabled: !invited && memberIndex < 4,
        lastLoginAt: invited ? "—" : "2026-11-25 09:30",
        lastLoginIp: invited
          ? "—"
          : `192.0.2.${teamIndex * 5 + memberIndex + 1}`,
      }
    })
)
