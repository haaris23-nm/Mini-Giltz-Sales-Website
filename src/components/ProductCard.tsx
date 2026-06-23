import React from "react";
import { Product } from "../types";
import { Star, Eye, ShoppingCart, Heart } from "lucide-react";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e?: React.MouseEvent) => void;
  isWishlisted: boolean;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  const discountedPrice = Math.round(product.price * (1 - product.discountPercentage / 100));

  return (
    <div
      id={`prod-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="bg-white rounded-xl border border-slate-100 hover:border-pink-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col h-full relative"
    >
      {/* Discount Badge */}
      {product.discountPercentage > 0 && (
        <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
          {Math.round(product.discountPercentage)}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        id={`wish-btn-${product.id}`}
        onClick={(e) => onToggleWishlist(product, e)}
        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-xs rounded-full shadow-sm text-slate-400 hover:text-pink-600 hover:bg-white transition-all duration-150 z-10"
      >
        <Heart
          className={`h-4 w-4 ${isWishlisted ? "fill-pink-600 text-pink-600" : ""}`}
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {product.isUnavailable && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center z-10 animate-in fade-in duration-150">
            <span className="bg-slate-800/90 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg tracking-wider">
              Unavailable
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button className="p-2 bg-white rounded-full text-slate-700 hover:text-pink-600 shadow-sm transition-transform scale-90 group-hover:scale-100">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand */}
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
          {product.brand}
        </span>

        {/* Name */}
        <h3 className="font-medium text-slate-800 text-sm line-clamp-2 leading-snug mb-2 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating Star Banner */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
            <span>{product.ratings.toFixed(1)}</span>
            <Star className="h-3 w-3 fill-current" />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            ({product.reviewsCount} reviews)
          </span>
          {product.isUnavailable ? (
            <span className="ml-auto text-xs font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              Unavailable
            </span>
          ) : product.stockQuantity < 10 && product.stockQuantity > 0 ? (
            <span className="ml-auto text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
              Only {product.stockQuantity} Left
            </span>
          ) : product.stockQuantity === 0 ? (
            <span className="ml-auto text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              Out of Stock
            </span>
          ) : null}
        </div>

        {/* Price & Cart Segment */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-slate-900 font-display">
            ₹{discountedPrice}
          </span>
          {product.discountPercentage > 0 && (
            <>
              <span className="text-xs text-slate-400 line-through">
                ₹{product.price}
              </span>
            </>
          )}
        </div>

        {/* Quick Add To Cart Button */}
        <button
          id={`add-cart-btn-${product.id}`}
          onClick={(e) => onAddToCart(product, e)}
          disabled={product.stockQuantity === 0 || product.isUnavailable}
          className={`mt-3 w-full border font-semibold py-1.5 px-3 rounded text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            product.isUnavailable
              ? "opacity-50 cursor-not-allowed border-slate-300 text-slate-400 bg-slate-50"
              : product.stockQuantity === 0
              ? "opacity-50 cursor-not-allowed border-slate-300 text-slate-400 bg-slate-50"
              : "border-pink-600 text-pink-600 hover:bg-pink-50"
          }`}
        >
          <ShoppingCart className="h-3 w-3" />
          {product.isUnavailable ? "Currently Unavailable" : product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
