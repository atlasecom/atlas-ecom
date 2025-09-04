import React from "react";
import { useTranslation } from "react-i18next";
import { 
  FiTruck, 
  FiGift, 
  FiAward 
} from "react-icons/fi";

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: FiTruck,
      title: t('features.delivery.title', 'Livraison'),
      subtitle: t('features.delivery.subtitle', 'Partout au Maroc'),
      color: 'text-orange-600'
    },
    {
      icon: FiGift,
      title: t('features.offers.title', 'Offres Surprise Quotidiennes'),
      subtitle: t('features.offers.subtitle', 'Économisez jusqu\'à 25%'),
      color: 'text-orange-600'
    },
    {
      icon: FiAward,
      title: t('features.prices.title', 'Prix Abordables'),
      subtitle: t('features.prices.subtitle', 'Obtenez le prix direct d\'usine'),
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className={`p-2 rounded-full bg-orange-50 border-2 border-orange-200 ${feature.color}`}>
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-base font-bold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {feature.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Features;
