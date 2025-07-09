import { NETWOR_TYPE, OS_TYPE, RAM_OR_STORAGE_OR_GRAPHICS_CARD, STORAGE_TYPE } from '../variant/variant.enums';
import { ISingleVariantField } from './variantField.interface';

const createVariantFields = (values: string[]): ISingleVariantField[] => 
  values.map(value => ({ name: value }));

const createVariantFieldsWithCode = (values: Array<{name: string, code: string}>): ISingleVariantField[] => 
  values.map(({name, code}) => ({ name, code }));

export const variantFieldFilterableFields = ['searchTerm', 'field'];

export const variantFieldSearchableFields = ['field'];

export const defaultVariantFields = {
    network_type: createVariantFields(Object.values(NETWOR_TYPE)),
    operating_system: createVariantFields(Object.values(OS_TYPE)),
    ram: createVariantFields([
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.TWOGB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.FOURGB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.EIGHTGB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.ONE6GB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.THREE2GB,
    ]),
    storage: createVariantFields([
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.SIX4GB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.ONE28GB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.TWO56GB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.FIVE12GB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.ONETB,
    ]),
    storage_type: createVariantFields(Object.values(STORAGE_TYPE)),
    graphics_card_size: createVariantFields([
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.TWOGB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.FOURGB,
        RAM_OR_STORAGE_OR_GRAPHICS_CARD.EIGHTGB,
    ]),
    processor_type: createVariantFields([
        'Intel Core i3',
        'Intel Core i5',
        'Intel Core i7',
        'Intel Core i9',
        'AMD Ryzen 3',
        'AMD Ryzen 5',
        'AMD Ryzen 7',
        'AMD Ryzen 9',
        'Apple M1',
        'Apple M2',
        'Qualcomm Snapdragon',
        'MediaTek Dimensity',
    ]),
    graphics_card_type: createVariantFields([
        'NVIDIA GeForce RTX',
        'NVIDIA GeForce GTX',
        'AMD Radeon RX',
        'Intel Iris Xe',
        'Apple M1/M2 GPU',
        'NVIDIA Quadro',
        'AMD Radeon Pro',
        'NVIDIA TITAN',
    ]),
    lens_kit: createVariantFields([
        'Body Only',
        '18-55mm Kit Lens',
        '24-70mm Standard Zoom',
        '70-200mm Telephoto Zoom',
        '50mm Prime',
        '35mm Prime',
        '85mm Prime',
        'Macro Lens',
        'Wide Angle',
        'Fisheye',
    ]),
    fabric: createVariantFields([
        'Cotton',
        'Polyester',
        'Wool',
        'Silk',
        'Linen',
        'Denim',
        'Nylon',
        'Spandex',
        'Velvet',
        'Leather',
        'Suede',
        'Cashmere',
    ]),
    weight: createVariantFields([
        '0.5 kg', '1 kg', '1.5 kg', '2 kg', '2.5 kg', '3 kg', '3.5 kg', '4 kg', '4.5 kg', '5 kg', 
        '6 kg', '7 kg', '8 kg', '9 kg', '10 kg', '15 kg', '20 kg', '25 kg', '30 kg', '40 kg', 
        '50 kg', '75 kg', '100 kg',
    ]),
    dimensions: createVariantFields([
        '10x10x5 cm',
        '15x15x10 cm',
        '20x20x15 cm',
        '30x20x10 cm',
        '40x30x20 cm',
        '50x40x30 cm',
        '60x40x40 cm',
        '80x60x40 cm',
        '100x80x50 cm',
        '120x80x60 cm',
        '150x100x60 cm',
        '200x100x80 cm',
    ]),
    options: [
        'Wireless Charging',
        'Waterproof',
        'Shockproof',
        'Bluetooth',
        'WiFi',
        'Touchscreen',
        'Backlit Keyboard',
        'Fingerprint Reader',
        'Face Recognition',
        'Stylus Support',
        '4G LTE',
        '5G',
        'NFC',
        'GPS',
        'USB-C',
        'Thunderbolt',
        'HDMI',
        'Ethernet',
    ],
    color: createVariantFieldsWithCode([
        { name: 'Black', code: '#000000' },
        { name: 'White', code: '#FFFFFF' },
        { name: 'Silver', code: '#C0C0C0' },
        { name: 'Gold', code: '#FFD700' },
        { name: 'Space Gray', code: '#717378' },
        { name: 'Rose Gold', code: '#B76E79' },
        { name: 'Midnight Green', code: '#004953' },
        { name: 'Crimson Red', code: '#DC143C' },
        { name: 'Royal Blue', code: '#4169E1' },
        { name: 'Blush Pink', code: '#F2B1D8' },
    ]),
    screen_size: createVariantFields([
        '13.3"', '14"', '15.6"', '16"', '17.3"', '24"', '27"', '32"', '34"', '38"', 
        '42"', '49"', '55"', '65"', '75"', '85"'
    ]),
    resolution: createVariantFields([
        'HD', 'Full HD', '2K', '4K UHD', '5K', '8K', 'Retina', 'Super Retina XDR'
    ]),
    processor: createVariantFields([
        'i3', 'i5', 'i7', 'i9', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'M1', 'M2', 'M2 Pro', 'M2 Max'
    ]),
    size: createVariantFields([
        'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', 
        '36', '38', '40', '42', '44', '46', '48', '50'
    ]),
    material: createVariantFields([
        'Plastic', 'Metal', 'Glass', 'Leather', 'Fabric', 'Wood', 'Ceramic', 
        'Carbon Fiber', 'Aluminum', 'Stainless Steel', 'Titanium', 'Silicone'
    ]),
    capacity: createVariantFields([
        '250ml', '500ml', '750ml', '1L', '1.5L', '2L', '3L', '4L', '5L', '10L', '20L', '50L', '100L'
    ]),
};

export const variantFieldPopulate = '';
