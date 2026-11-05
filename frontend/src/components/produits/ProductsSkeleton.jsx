function ProductsSkeleton() {
  return (
    <div className="products-skeleton" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="products-skeleton-row" key={index}>
          {Array.from({ length: 6 }, (_, cell) => <span key={cell} />)}
        </div>
      ))}
    </div>
  );
}

export default ProductsSkeleton;
