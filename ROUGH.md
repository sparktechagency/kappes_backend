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
# shop model
 ## owner of a shop cant be admin of any other shop (need decision)
 ## making admin of a user will change his role to shop_admin and he will not be able to purchase just handle the shop activities (need decision)
 ## while removing admin check if this user is as admin of any shop if yes then remove admin role from that shop but dont change is user.shop_admin but he becomes non responsible as admin to any shop (if we remove admin role from user) then make him user.role.USER
 # coupon module (pending)
 ## routes done testng pending
 # offerd module (pending)
 ## routes done testng pending