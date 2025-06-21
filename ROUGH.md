# user model (ongoing) // vendor and shop admin role to handled 
 ## createSellerAccount route এ একইসাথে Vender account + Shop Create করতে হবে
# auth model (done)
# category model (done)
# subcategory model (done)
 ## getSubcategorisedVariantFields route বানাতে হবে  Variant মডেল থেকে
# variant model (done) 
 ## getSubcategorisedVariantFields route বানাতে হবে  Variant মডেল থেকে
# brand model (ongoing) 
# product model (pending)
 ## প্রতিটা getsingle এ product.viewCount+category.ctgViewCount বাড়াতে হবে
 ## প্রতিটা product create করার সময় req.body.data তে variante এর field আসবে তাই আমাকে createProductService এ এই ফিল্ড গুলো কে দিয়ে slug generate করে তা দিয়ে variant get করতে হবে
 ## প্রতিটা product create করার সময় frontend এ subCTg based variant field গুলো দেখাতে হবে যেতে createProductService এ সেই field গুলোই দেয়
# order model (pending)
 ## প্রতিটা createorder এ product.purchaseCount  বাড়াতে হবে