"use client";

import {
  Container,
  PageHeader,
  Section,
  Grid,
  Stack,
  Inline,
  Divider,
} from "@/components/layout/primitives";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessState,
  InfoState,
} from "@/components/ui/patterns";
import {
  Package,
  Inbox,
  Mail,
  Calendar,
  Settings,
  User,
  Search,
  Plus,
  Download,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

export default function UIShowcasePage() {
  return (
    <div className="min-h-screen bg-bg">
      <Container size="2xl">
        <PageHeader
          heading="Design System Showcase"
          text="A comprehensive demonstration of our polished UI components, tokens, and patterns"
        >
          <Button variant="brand">
            <Download className="mr-2 size-4" />
            Export Tokens
          </Button>
        </PageHeader>

        {/* Typography Section */}
        <Section spacing="lg">
          <Stack spacing="lg">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Typography Scale
              </h2>
              <p className="text-text-secondary">
                Consistent type hierarchy with proper line-height and tracking
              </p>
            </div>

            <Card elevation="sm">
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-5xl font-bold text-text-primary">
                    Display Large (48px)
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-text-primary">
                    Display Medium (36px)
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-text-primary">
                    Heading 1 (30px)
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-text-primary">
                    Heading 2 (24px)
                  </p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-text-primary">
                    Heading 3 (20px)
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium text-text-primary">
                    Body Large (18px)
                  </p>
                </div>
                <div>
                  <p className="text-base text-text-primary">
                    Body Default (16px) – This is the standard text size for most content.
                    Line length should be 60-75 characters for optimal readability.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">
                    Body Small (14px) – Secondary information
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">
                    Caption (12px) – Tertiary metadata
                  </p>
                </div>
              </CardContent>
            </Card>
          </Stack>
        </Section>

        <Divider spacing="lg" />

        {/* Color Tokens */}
        <Section spacing="lg">
          <Stack spacing="lg">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Color Palette
              </h2>
              <p className="text-text-secondary">
                Semantic color tokens with consistent hover and subtle variants
              </p>
            </div>

            <Grid cols={3} gap="md">
              <Card elevation="sm">
                <CardContent className="space-y-3 pt-6">
                  <div className="h-20 rounded-md bg-brand" />
                  <div>
                    <p className="font-semibold text-text-primary">Brand</p>
                    <p className="text-sm text-text-secondary">Primary actions</p>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="sm">
                <CardContent className="space-y-3 pt-6">
                  <div className="h-20 rounded-md bg-success" />
                  <div>
                    <p className="font-semibold text-text-primary">Success</p>
                    <p className="text-sm text-text-secondary">Positive states</p>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="sm">
                <CardContent className="space-y-3 pt-6">
                  <div className="h-20 rounded-md bg-warning" />
                  <div>
                    <p className="font-semibold text-text-primary">Warning</p>
                    <p className="text-sm text-text-secondary">Caution states</p>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="sm">
                <CardContent className="space-y-3 pt-6">
                  <div className="h-20 rounded-md bg-danger" />
                  <div>
                    <p className="font-semibold text-text-primary">Danger</p>
                    <p className="text-sm text-text-secondary">Destructive actions</p>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="sm">
                <CardContent className="space-y-3 pt-6">
                  <div className="h-20 rounded-md bg-info" />
                  <div>
                    <p className="font-semibold text-text-primary">Info</p>
                    <p className="text-sm text-text-secondary">Informational</p>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="sm">
                <CardContent className="space-y-3 pt-6">
                  <div className="h-20 rounded-md bg-surface border border-border-default" />
                  <div>
                    <p className="font-semibold text-text-primary">Surface</p>
                    <p className="text-sm text-text-secondary">Cards & panels</p>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Stack>
        </Section>

        <Divider spacing="lg" />

        {/* Buttons */}
        <Section spacing="lg">
          <Stack spacing="lg">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Buttons
              </h2>
              <p className="text-text-secondary">
                Interactive elements with elevation, hover states, and focus rings
              </p>
            </div>

            <Card elevation="sm">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>
                  Different visual styles for various contexts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Grid cols={3} gap="md">
                  <Stack spacing="sm">
                    <Button variant="default">Default</Button>
                    <Button variant="brand">Brand</Button>
                    <Button variant="destructive">Destructive</Button>
                  </Stack>
                  <Stack spacing="sm">
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                  </Stack>
                  <Stack spacing="sm">
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="link">Link Button</Button>
                  </Stack>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation="sm">
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>
                  Consistent hit targets for all interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Inline spacing="md" align="center">
                  <Button size="sm" variant="brand">Small</Button>
                  <Button size="default" variant="brand">Default</Button>
                  <Button size="md" variant="brand">Medium</Button>
                  <Button size="lg" variant="brand">Large</Button>
                </Inline>
              </CardContent>
            </Card>

            <Card elevation="sm">
              <CardHeader>
                <CardTitle>Icon Buttons</CardTitle>
              </CardHeader>
              <CardContent>
                <Inline spacing="md">
                  <Button size="icon-sm" variant="outline">
                    <Edit className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Eye className="size-4" />
                  </Button>
                  <Button size="icon-lg" variant="outline">
                    <Trash2 className="size-5" />
                  </Button>
                </Inline>
              </CardContent>
            </Card>
          </Stack>
        </Section>

        <Divider spacing="lg" />

        {/* Cards & Elevation */}
        <Section spacing="lg">
          <Stack spacing="lg">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Cards & Elevation
              </h2>
              <p className="text-text-secondary">
                Layered surfaces with subtle shadows and depth
              </p>
            </div>

            <Grid cols={3} gap="md">
              <Card elevation="none" variant="outlined">
                <CardHeader>
                  <CardTitle>No Shadow</CardTitle>
                  <CardDescription>Flat surface, outlined</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary">
                    elevation="none"
                  </p>
                </CardContent>
              </Card>

              <Card elevation="sm">
                <CardHeader>
                  <CardTitle>Subtle Elevation</CardTitle>
                  <CardDescription>Default card shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary">
                    elevation="sm"
                  </p>
                </CardContent>
              </Card>

              <Card elevation="md">
                <CardHeader>
                  <CardTitle>Medium Elevation</CardTitle>
                  <CardDescription>Raised surface</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary">
                    elevation="md"
                  </p>
                </CardContent>
              </Card>
            </Grid>

            <Card elevation="lg">
              <CardHeader>
                <CardTitle>Large Elevation</CardTitle>
                <CardDescription>Modal or sheet-level depth</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">
                  This card floats above the rest with a prominent shadow. Use for
                  modals, dialogs, and floating panels.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="brand">Primary Action</Button>
                <Button variant="outline">Cancel</Button>
              </CardFooter>
            </Card>
          </Stack>
        </Section>

        <Divider spacing="lg" />

        {/* Form Elements */}
        <Section spacing="lg">
          <Stack spacing="lg">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Form Elements
              </h2>
              <p className="text-text-secondary">
                Accessible inputs with consistent sizing and clear states
              </p>
            </div>

            <Grid cols={2} gap="lg">
              <Card elevation="sm">
                <CardHeader>
                  <CardTitle>Input Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-input">Default Input</Label>
                    <Input
                      id="default-input"
                      placeholder="Enter text..."
                      variant="default"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="success-input">Success State</Label>
                    <Input
                      id="success-input"
                      placeholder="Valid input"
                      variant="success"
                      defaultValue="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="error-input">Error State</Label>
                    <Input
                      id="error-input"
                      placeholder="Invalid input"
                      variant="error"
                      defaultValue="invalid@"
                    />
                    <p className="text-xs text-danger">
                      Please enter a valid email address
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="sm">
                <CardHeader>
                  <CardTitle>Textarea & Sizes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="textarea">Textarea</Label>
                    <Textarea
                      id="textarea"
                      placeholder="Enter a longer message..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="small-input">Small Input</Label>
                    <Input
                      id="small-input"
                      inputSize="sm"
                      placeholder="Small size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="large-input">Large Input</Label>
                    <Input
                      id="large-input"
                      inputSize="lg"
                      placeholder="Large size"
                    />
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Stack>
        </Section>

        <Divider spacing="lg" />

        {/* State Patterns */}
        <Section spacing="lg">
          <Stack spacing="lg">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                State Patterns
              </h2>
              <p className="text-text-secondary">
                Consistent feedback components for various application states
              </p>
            </div>

            <Card elevation="sm">
              <CardHeader>
                <CardTitle>Inline States</CardTitle>
                <CardDescription>
                  Compact state indicators for forms and lists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SuccessState
                  variant="inline"
                  title="Changes saved successfully"
                  description="Your settings have been updated."
                />
                <ErrorState
                  variant="inline"
                  title="Failed to save changes"
                  description="Please check your internet connection and try again."
                />
                <InfoState
                  variant="inline"
                  title="New features available"
                  description="Check out what's new in this release."
                />
                <LoadingState
                  variant="inline"
                  text="Saving changes..."
                  size="sm"
                />
              </CardContent>
            </Card>

            <Grid cols={2} gap="lg">
              <EmptyState
                icon={Inbox}
                title="No properties found"
                description="Get started by adding your first property to the system."
                action={{
                  label: "Add Property",
                  onClick: () => console.log("Add property clicked"),
                }}
              />

              <LoadingState
                text="Loading properties..."
                size="md"
              />
            </Grid>

            <Grid cols={2} gap="lg">
              <ErrorState
                title="Failed to load data"
                description="We couldn't retrieve your properties. This might be a temporary issue."
                retry={() => console.log("Retry clicked")}
              />

              <SuccessState
                title="Property created!"
                description="Your new property has been added to the system successfully."
                action={{
                  label: "View Property",
                  onClick: () => console.log("View clicked"),
                }}
              />
            </Grid>
          </Stack>
        </Section>

        <Divider spacing="lg" />

        {/* Layout Primitives */}
        <Section spacing="lg">
          <Stack spacing="lg">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Layout Primitives
              </h2>
              <p className="text-text-secondary">
                Consistent spacing and grid systems for clean layouts
              </p>
            </div>

            <Card elevation="sm">
              <CardHeader>
                <CardTitle>Stack (Vertical)</CardTitle>
                <CardDescription>
                  Vertical spacing with configurable gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stack spacing="md">
                  <div className="rounded-md bg-brand/10 p-4 text-sm">Item 1</div>
                  <div className="rounded-md bg-brand/10 p-4 text-sm">Item 2</div>
                  <div className="rounded-md bg-brand/10 p-4 text-sm">Item 3</div>
                </Stack>
              </CardContent>
            </Card>

            <Card elevation="sm">
              <CardHeader>
                <CardTitle>Inline (Horizontal)</CardTitle>
                <CardDescription>
                  Horizontal flex with wrapping and alignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Inline spacing="md" wrap>
                  <div className="rounded-md bg-success/10 px-4 py-2 text-sm">Tag 1</div>
                  <div className="rounded-md bg-success/10 px-4 py-2 text-sm">Tag 2</div>
                  <div className="rounded-md bg-success/10 px-4 py-2 text-sm">Tag 3</div>
                  <div className="rounded-md bg-success/10 px-4 py-2 text-sm">Tag 4</div>
                  <div className="rounded-md bg-success/10 px-4 py-2 text-sm">Tag 5</div>
                </Inline>
              </CardContent>
            </Card>

            <Card elevation="sm">
              <CardHeader>
                <CardTitle>Grid (Responsive)</CardTitle>
                <CardDescription>
                  12-column grid with consistent gutters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Grid cols={4} gap="md">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex h-20 items-center justify-center rounded-md bg-info/10 text-sm font-medium"
                    >
                      Col {i + 1}
                    </div>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Section>

        {/* Footer spacing */}
        <div className="pb-20" />
      </Container>
    </div>
  );
}
