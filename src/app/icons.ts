// Importación centralizada de Ionicons
import { addIcons } from 'ionicons';
import {
  cloudDoneOutline,
  cloudOfflineOutline,
  cloudOutline,
  cloudUploadOutline,
  refresh,
  storefrontOutline,
  addOutline,
  trashOutline,
  createOutline,
  searchOutline,
  cartOutline,
  personOutline,
  chatbubbleOutline,
  homeOutline,
  logOutOutline,
  cameraOutline,
  imageOutline,
  closeOutline,
  checkmarkOutline,
  alertCircleOutline,
  informationCircleOutline,
  arrowBack,
  chevronBack,
  chevronForward
} from 'ionicons/icons';

// Registrar todos los iconos usados en la aplicación
export function registerIcons() {
  addIcons({
    'cloud-done-outline': cloudDoneOutline,
    'cloud-offline-outline': cloudOfflineOutline,
    'cloud-outline': cloudOutline,
    'cloud-upload-outline': cloudUploadOutline,
    'refresh': refresh,
    'storefront-outline': storefrontOutline,
    'add-outline': addOutline,
    'trash-outline': trashOutline,
    'create-outline': createOutline,
    'search-outline': searchOutline,
    'cart-outline': cartOutline,
    'person-outline': personOutline,
    'chatbubble-outline': chatbubbleOutline,
    'home-outline': homeOutline,
    'log-out-outline': logOutOutline,
    'camera-outline': cameraOutline,
    'image-outline': imageOutline,
    'close-outline': closeOutline,
    'checkmark-outline': checkmarkOutline,
    'alert-circle-outline': alertCircleOutline,
    'information-circle-outline': informationCircleOutline,
    'arrow-back': arrowBack,
    'chevron-back': chevronBack,
    'chevron-forward': chevronForward,
  });
}
