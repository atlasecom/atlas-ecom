const styles = {
  custom_container: "w-11/12 hidden sm:block",
  heading:
    "text-[27px] text-center md:text-start font-[600] font-Roboto pb-[20px]",
  section: "w-11/12 mx-auto",
  productTitle: "text-[25px] font-[600] font-Roboto text-[#333]",
  productDiscountPrice: "font-bold text-[18px] text-[#333] font-Roboto",
  price: "font-[500] text-[16px] text-[#d55b45] pl-3 mt-[-4px] line-through",
  shop_name: "pt-3 text-[15px] text-blue-400 pb-3",
  active_indicator: "absolute bottom-[-27%] left-0 h-[3px] w-full bg-[crimson]",
  button:
    "w-[150px] bg-black h-[50px] my-3 flex items-center justify-center rounded-xl cursor-pointer",
  cart_button:
    "px-[20px] h-[38px] rounded-[20px] bg-[#f63b60] flex items-center justify-center cursor-pointer",
  cart_button_text: "text-[#fff] text-[16px] font-[600]",
  input: "w-full border p-1 rounded-[5px]",
  activeStatus:
    "w-[10px] h-[10px] rounded-full absolute top-0 right-1 bg-[#40d132]",
  noramlFlex: "flex items-center",
  sectionNoGap: "w-11/12 mx-auto",
  
  // Professional Design Classes
  card: "bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500",
  buttonPrimary: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95",
  buttonSecondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95",
  titleLarge: "text-4xl md:text-5xl font-bold text-gray-900",
  titleMedium: "text-2xl md:text-3xl font-bold text-gray-800",
  subtitle: "text-xl text-gray-600",
  textBody: "text-base text-gray-700",
  textSmall: "text-sm text-gray-500",
  
  // Interactive Elements
  hoverScale: "hover:scale-105 transition-transform duration-300",
  smoothTransition: "transition-all duration-300 ease-out",
  glassEffect: "bg-white/90 backdrop-blur-sm border border-white/20",
  
  // Animation classes
  fadeIn: "animate-fadeIn",
  infinite_carousel: "animate-infiniteScrollRight",
  slideUp: "animate-slideInUp",
  slideIn: "animate-slideInRight",
  
  // Professional Layout
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  heroSection: "bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16",
  filterSidebar: "bg-white rounded-3xl shadow-2xl border border-gray-100 p-8",
  productGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  pagination: "flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-2",
};

export default styles;
