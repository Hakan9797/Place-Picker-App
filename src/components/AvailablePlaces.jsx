import Places from "./Places.jsx";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";
import { useFetch } from "../hooks/useFetch.js";

// Asenkron bir fonksiyon olan fecthSortedPlaces, mevcut yerleri alır ve bunları kullanıcının konumuna göre sıralar.
async function fecthSortedPlaces() {
  // fetchAvailablePlaces fonksiyonu ile mevcut yerler alınır.
  const places = await fetchAvailablePlaces();
  
  // Yeni bir Promise döndürülür ve bu Promise içinde navigator.geolocation kullanılarak kullanıcının mevcut konumu alınır.
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      // Alınan konuma göre yerler mesafeye göre sıralanır.
      const sortedPlaces = sortPlacesByDistance(
        places,
        position.coords.latitude,
        position.coords.longitude
      );
      // Sıralanmış yerler Promise'in çözümü olarak döndürülür.
      resolve(sortedPlaces);
    });
  });
}

// AvailablePlaces adında bir React component'i tanımlanır ve bu component, onSelectPlace adında bir props alır.
export default function AvailablePlaces({ onSelectPlace }) {
  // useFetch hook'u çağrılarak fecthSortedPlaces fonksiyonu çalıştırılır ve dönen değerler destructuring ile alınır.
  const {
    isFetching,      // Veri çekme işleminin devam edip etmediğini belirtir.
    error,           // Bir hata oluşup oluşmadığını belirtir.
    fetchedData: availablePlaces, // Çekilen verileri içerir.
  } = useFetch(fecthSortedPlaces, []); // İkinci argüman olarak boş bir bağımlılık dizisi verilir, bu sayede yalnızca ilk render'da çalışır.

  // Eğer bir hata varsa, Error component'i döndürülür.
  if (error) {
    return <Error title="An error occurred!" message={error.message} />;
  }

  // Eğer hata yoksa, Places component'i döndürülür ve gerekli props'lar iletilir.
  return (
    <Places
      title="Available Places"                // Places component'ine bir başlık verilir.
      places={availablePlaces}                // Çekilen ve sıralanan yerler props olarak iletilir.
      isLoading={isFetching}                  // Veri çekme işleminin devam edip etmediği bilgisi iletilir.
      loadingText="Fetching place data..."    // Veri çekme işlemi sırasında gösterilecek metin.
      fallbackText="No places available."     // Eğer yer yoksa gösterilecek metin.
      onSelectPlace={onSelectPlace}           // Bir yer seçildiğinde çağrılacak fonksiyon props olarak iletilir.
    />
  );
}
