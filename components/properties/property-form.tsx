"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createProperty, updateProperty } from "@/actions/properties";
import { uploadPropertyImages } from "@/actions/media";
import { propertyFormSchema, PropertyFormData } from "@/lib/validations/property";
import { PropertyType, PropertyStatus, TransactionType, MarketingStatus } from "@prisma/client";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
import { TOAST_SUCCESS, TOAST_ERROR } from "@/lib/toast-messages";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface PropertyFormProps {
  property?: any; // Full property object for editing
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [features, setFeatures] = useState<string[]>(
    property?.features ? (Array.isArray(property.features) ? property.features : []) : []
  );
  const [newFeature, setNewFeature] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      propertyType: property?.propertyType || PropertyType.APARTMENT,
      status: property?.status || PropertyStatus.AVAILABLE,
      transactionType: property?.transactionType || TransactionType.SALE,
      price: property?.price ? Number(property.price) : 0,
      bedrooms: property?.bedrooms || undefined,
      bathrooms: property?.bathrooms || undefined,
      size: property?.size ? Number(property.size) : undefined,
      yearBuilt: property?.yearBuilt || undefined,
      features: features,
      description: property?.description || "",
      country: property?.address?.country || "Greece",
      region: property?.address?.region || "",
      city: property?.address?.city || "",
      street: property?.address?.street || "",
      number: property?.address?.number || "",
      postalCode: property?.address?.postalCode || "",
      locationText: property?.address?.locationText || "",
      marketingStatus: property?.listing?.marketingStatus || MarketingStatus.DRAFT,
      listPrice: property?.listing?.listPrice ? Number(property.listing.listPrice) : (property?.price ? Number(property.price) : 0),
      listingNotes: property?.listing?.notes || "",
    },
  });

  const convertFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = { ...data, features };
      
      if (property) {
        const result = await updateProperty(property.id, formData);
        
        if (!result.success) {
          // Handle validation errors
          if (result.validationErrors) {
            Object.entries(result.validationErrors).forEach(([field, message]) => {
              form.setError(field as any, { message });
            });
          }
          toast.error(result.error || TOAST_ERROR.PROPERTY_UPDATE_FAILED);
          setIsSubmitting(false);
          return;
        }
        
        // Upload images if any
        if (images.length > 0) {
          const imageDataUrls = await Promise.all(
            images.map(async (img, index) => ({
              dataUrl: await convertFileToDataUrl(img.file),
              isPrimary: img.isPrimary,
              displayOrder: index,
            }))
          );
          const uploadResult = await uploadPropertyImages(property.id, imageDataUrls);
          if (!uploadResult.success) {
            toast.warning("Property updated, but image upload failed. Please try uploading images again.");
          }
        }
        
        toast.success(TOAST_SUCCESS.PROPERTY_UPDATED);
        router.push(`/dashboard/properties/${property.id}`);
      } else {
        const result = await createProperty(formData);
        
        if (!result.success) {
          // Handle validation errors
          if (result.validationErrors) {
            Object.entries(result.validationErrors).forEach(([field, message]) => {
              form.setError(field as any, { message });
            });
          }
          toast.error(result.error || TOAST_ERROR.PROPERTY_CREATE_FAILED);
          setIsSubmitting(false);
          return;
        }
        
        // Upload images if any
        if (images.length > 0 && result.data?.propertyId) {
          const imageDataUrls = await Promise.all(
            images.map(async (img, index) => ({
              dataUrl: await convertFileToDataUrl(img.file),
              isPrimary: img.isPrimary,
              displayOrder: index,
            }))
          );
          const uploadResult = await uploadPropertyImages(result.data.propertyId, imageDataUrls);
          if (!uploadResult.success) {
            toast.warning("Property created, but image upload failed. Please try uploading images again.");
          }
        }
        
        toast.success(TOAST_SUCCESS.PROPERTY_CREATED);
        router.push(`/dashboard/properties/${result.data?.propertyId}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(property ? TOAST_ERROR.PROPERTY_UPDATE_FAILED : TOAST_ERROR.PROPERTY_CREATE_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      form.setValue("features", updatedFeatures);
      setNewFeature("");
    }
  };

  const removeFeature = (featureToRemove: string) => {
    const updatedFeatures = features.filter(feature => feature !== featureToRemove);
    setFeatures(updatedFeatures);
    form.setValue("features", updatedFeatures);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/properties">
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : property ? "Update Property" : "Create Property"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Property Basics */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PropertyType.APARTMENT}>Apartment</SelectItem>
                            <SelectItem value={PropertyType.HOUSE}>House</SelectItem>
                            <SelectItem value={PropertyType.LAND}>Land</SelectItem>
                            <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                            <SelectItem value={PropertyType.OTHER}>Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PropertyStatus.AVAILABLE}>Available</SelectItem>
                            <SelectItem value={PropertyStatus.UNDER_OFFER}>Under Offer</SelectItem>
                            <SelectItem value={PropertyStatus.SOLD}>Sold</SelectItem>
                            <SelectItem value={PropertyStatus.RENTED}>Rented</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={TransactionType.SALE}>Sale</SelectItem>
                            <SelectItem value={TransactionType.RENT}>Rent</SelectItem>
                            <SelectItem value={TransactionType.LEASE}>Lease</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (€) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Property Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            step="0.5"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (m²)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearBuilt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1800"
                            max={new Date().getFullYear() + 5}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a feature (e.g., Balcony, Parking, etc.)"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-sm">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="ml-2 h-3 w-3 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the property, its features, and selling points..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Marketing description that will be visible to potential buyers/renters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="locationText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Location Info</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Additional directions or location details..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Listing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="marketingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marketing Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MarketingStatus.DRAFT}>Draft</SelectItem>
                          <SelectItem value={MarketingStatus.ACTIVE}>Active</SelectItem>
                          <SelectItem value={MarketingStatus.ARCHIVED}>Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Draft: Not visible to public. Active: Live listing. Archived: Hidden from listings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="listPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Price (€) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Price displayed in listings (can differ from internal price).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="listingNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Internal notes for your team..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        These notes are only visible to your organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload 
                  onImagesChange={setImages}
                  existingImages={[]}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {images.length > 0 
                    ? `${images.length} image(s) ready to upload with property` 
                    : "Upload up to 8 images (max 5MB each). Automatically compressed to AVIF format."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}