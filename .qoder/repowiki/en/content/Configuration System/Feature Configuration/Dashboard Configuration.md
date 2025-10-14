# Dashboard Configuration

<cite>
**Referenced Files in This Document**   
- [dashboard.ts](file://config/dashboard.ts)
- [info-card.tsx](file://components/dashboard/info-card.tsx)
- [line-chart-multiple.tsx](file://components/charts/line-chart-multiple.tsx)
- [page.tsx](file://app/(protected)/dashboard/page.tsx)
- [charts/page.tsx](file://app/(protected)/dashboard/charts/page.tsx)
- [index.d.ts](file://types/index.d.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Dashboard Configuration Structure](#dashboard-configuration-structure)
3. [Role-Based Access Control](#role-based-access-control)
4. [Dashboard Layout and Component Rendering](#dashboard-layout-and-component-rendering)
5. [Chart Configuration and Data Visualization](#chart-configuration-and-data-visualization)
6. [Extending Dashboard Functionality](#extending-dashboard-functionality)
7. [Performance Considerations](#performance-considerations)

## Introduction
This document provides comprehensive documentation for the dashboard configuration system in the Next.js SaaS application. It explains how the `config/dashboard.ts` file defines the navigation structure, access control, and layout organization for the user dashboard. The configuration enables role-based content visibility, supports various chart types through reusable components, and allows for easy customization without code modifications. The system integrates with UI components to render dynamic content based on user roles and subscription tiers.

## Dashboard Configuration Structure

The dashboard configuration is defined in `config/dashboard.ts` and primarily consists of the `sidebarLinks` array, which structures the navigation menu for the application. This configuration follows a hierarchical pattern with sections and items, enabling organized presentation of dashboard features.

```mermaid
flowchart TD
A["dashboard.ts"] --> B["sidebarLinks Array"]
B --> C["Section: MENU"]
B --> D["Section: OPTIONS"]
C --> E["Admin Panel (Admin only)"]
C --> F["Dashboard"]
C --> G["Billing (User only)"]
C --> H["Charts"]
C --> I["Orders (Admin only)"]
D --> J["Settings"]
D --> K["Homepage"]
D --> L["Documentation"]
D --> M["Support (Disabled)"]
```

**Diagram sources**
- [dashboard.ts](file://config/dashboard.ts#L1-L53)

**Section sources**
- [dashboard.ts](file://config/dashboard.ts#L1-L53)

## Role-Based Access Control

The dashboard configuration implements role-based access control through the `authorizeOnly` property in navigation items. This property restricts access to specific routes based on user roles defined in the `UserRole` enum from Prisma. The system supports at least two roles: USER and ADMIN, with different dashboard content visibility based on these roles.

```mermaid
classDiagram
class UserRole {
<<enumeration>>
USER
ADMIN
}
class SidebarNavItem {
+title : string
+items : NavItem[]
+authorizeOnly? : UserRole
+icon? : string
}
class NavItem {
+href : string
+icon : string
+title : string
+authorizeOnly? : UserRole
+disabled? : boolean
+badge? : number
}
SidebarNavItem --> NavItem : "contains"
NavItem --> UserRole : "references"
```

**Diagram sources**
- [dashboard.ts](file://config/dashboard.ts#L1-L53)
- [index.d.ts](file://types/index.d.ts#L33-L38)

**Section sources**
- [dashboard.ts](file://config/dashboard.ts#L1-L53)
- [user-role-form.tsx](file://components/forms/user-role-form.tsx#L35-L133)
- [update-user-role.ts](file://actions/update-user-role.ts#L13-L39)

## Dashboard Layout and Component Rendering

The dashboard pages consume the configuration to render appropriate components based on the route. The main dashboard page displays a header with user role information and an empty placeholder for content, while specialized pages like the charts page render multiple visualization components in a responsive grid layout.

```mermaid
flowchart TD
A["Dashboard Page"] --> B["DashboardHeader"]
B --> C["Heading: Dashboard"]
B --> D["Text: Current Role"]
A --> E["EmptyPlaceholder"]
E --> F["Icon: post"]
E --> G["Title: No content created"]
E --> H["Description: You don't have any content yet"]
E --> I["Button: Add Content"]
J["Charts Page"] --> K["DashboardHeader"]
K --> L["Heading: Charts"]
K --> M["Text: List of charts by shadcn-ui"]
J --> N["Grid Layout"]
N --> O["RadialTextChart"]
N --> P["AreaChartStacked"]
N --> Q["BarChartMixed"]
N --> R["RadarChartSimple"]
N --> S["InteractiveBarChart"]
N --> T["RadialChartGrid"]
N --> U["RadialShapeChart"]
N --> V["LineChartMultiple"]
N --> W["RadialStackedChart"]
```

**Diagram sources**
- [page.tsx](file://app/(protected)/dashboard/page.tsx#L1-L31)
- [charts/page.tsx](file://app/(protected)/dashboard/charts/page.tsx#L1-L42)

**Section sources**
- [page.tsx](file://app/(protected)/dashboard/page.tsx#L1-L31)
- [charts/page.tsx](file://app/(protected)/dashboard/charts/page.tsx#L1-L42)
- [header.tsx](file://components/dashboard/header.tsx#L1-L20)

## Chart Configuration and Data Visualization

Chart components are configured with predefined settings that define their appearance and behavior. The `line-chart-multiple.tsx` component, for example, uses a `chartConfig` object to specify labels, colors, and other visualization options. This configuration-driven approach allows for consistent styling and easy customization without modifying component code.

```mermaid
flowchart TD
A["Chart Configuration"] --> B["chartConfig Object"]
B --> C["desktop: {label, color}"]
B --> D["mobile: {label, color}"]
A --> E["chartData Array"]
E --> F["month: string"]
E --> G["desktop: number"]
E --> H["mobile: number"]
I["LineChart Component"] --> J["ChartContainer"]
J --> K["XAxis: month"]
J --> L["Line: desktop"]
J --> M["Line: mobile"]
J --> N["ChartTooltip"]
J --> O["CartesianGrid"]
B --> I
E --> I
```

**Diagram sources**
- [line-chart-multiple.tsx](file://components/charts/line-chart-multiple.tsx#L1-L93)
- [chart.tsx](file://components/ui/chart.tsx#L10-L18)

**Section sources**
- [line-chart-multiple.tsx](file://components/charts/line-chart-multiple.tsx#L1-L93)
- [chart.tsx](file://components/ui/chart.tsx#L10-L18)
- [info-card.tsx](file://components/dashboard/info-card.tsx#L1-L23)

## Extending Dashboard Functionality

To extend dashboard functionality, developers can add new chart types by creating components in the `components/charts/` directory and importing them in the appropriate page. Modifying data sources involves updating the `chartData` structure in chart components or connecting to external data sources through API routes. The configuration system supports adding new navigation items with role-based access control.

```mermaid
flowchart TD
A["Add New Chart Type"] --> B["Create Component in components/charts/"]
B --> C["Import in charts/page.tsx"]
C --> D["Add to Grid Layout"]
E["Modify Data Source"] --> F["Update chartData in Component"]
F --> G["Or connect to API Route"]
G --> H["Update fetch logic"]
I["Add Navigation Item"] --> J["Update sidebarLinks in dashboard.ts"]
J --> K["Specify href, icon, title"]
K --> L["Set authorizeOnly if needed"]
L --> M["Set disabled if experimental"]
```

**Section sources**
- [dashboard.ts](file://config/dashboard.ts#L1-L53)
- [charts/page.tsx](file://app/(protected)/dashboard/charts/page.tsx#L1-L42)
- [line-chart-multiple.tsx](file://components/charts/line-chart-multiple.tsx#L1-L93)

## Performance Considerations

The dashboard implementation includes performance optimizations such as loading skeletons to provide visual feedback during data fetching. The responsive grid layout adapts to different screen sizes, ensuring optimal display across devices. For large datasets, the chart components should implement data sampling or pagination to maintain performance.

```mermaid
flowchart TD
A["Performance Features"] --> B["Loading Skeletons"]
B --> C["DashboardLoading"]
B --> D["ChartsLoading"]
B --> E["CardSkeleton"]
F["Responsive Design"] --> G["Grid with breakpoints"]
G --> H["sm:grid-cols-2"]
G --> I["2xl:grid-cols-4"]
J["Large Dataset Handling"] --> K["Implement data sampling"]
J --> L["Add pagination"]
J --> M["Use virtualization"]
```

**Diagram sources**
- [page.tsx](file://app/(protected)/dashboard/page.tsx#L1-L31)
- [charts/page.tsx](file://app/(protected)/dashboard/charts/page.tsx#L1-L42)
- [loading.tsx](file://app/(protected)/dashboard/loading.tsx#L1-L10)
- [charts/loading.tsx](file://app/(protected)/dashboard/charts/loading.tsx#L1-L19)

**Section sources**
- [loading.tsx](file://app/(protected)/dashboard/loading.tsx#L1-L10)
- [charts/loading.tsx](file://app/(protected)/dashboard/charts/loading.tsx#L1-L19)
- [page.tsx](file://app/(protected)/dashboard/page.tsx#L1-L31)
- [charts/page.tsx](file://app/(protected)/dashboard/charts/page.tsx#L1-L42)