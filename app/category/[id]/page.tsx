import React from 'react';
import { ProductService } from '@/lib/Services/admin/ProductService';
import { CategoryService } from '@/lib/Services/admin/CategoryService';
import CategoryClient from '../Components/CategoryClient';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const category = await CategoryService.getCategoryById(id);
    const name = (category as any).name || 'Category';
    return {
      title: `${name} | NextShop`,
      description: `Browse all ${name} products at NextShop.`,
    };
  } catch {
    return { title: 'Category | NextShop' };
  }
}

export const revalidate = 60;

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;

  let products: any[] = [];
  let categoryName = 'Products';
  let categoryImage = '';

  try {
    const [allProducts, category] = await Promise.all([
      ProductService.getAllProducts(),
      CategoryService.getCategoryById(id),
    ]);

    const cat = category as any;
    categoryName = cat.name || 'Products';
    categoryImage = cat.image?.url || '';

    // Filter products by this category
    products = JSON.parse(
      JSON.stringify(
        allProducts.filter(
          (p: any) => p.categoryId?._id?.toString() === id || p.categoryId?.toString() === id
        )
      )
    );
  } catch (error) {
    console.error('CategoryPage Error:', error);
  }

  return (
    <CategoryClient
      products={products}
      categoryName={categoryName}
      categoryImage={categoryImage}
      categoryId={id}
    />
  );
}
