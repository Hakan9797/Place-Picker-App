import { useRef, useState, useCallback } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";
import Error from "./components/Error.jsx";
import { useFetch } from "./hooks/useFetch.js";

function App() {
  // Seçilen yerin referansını tutmak için useRef kullanıyoruz
  const selectedPlace = useRef();

  // Hata durumunu tutmak için useState kullanıyoruz
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  // Modalın açık olup olmadığını tutmak için useState kullanıyoruz
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Kullanıcı yerlerini fetch etmek için useFetch hook'unu kullanıyoruz
  const {
    isFetching, // Veri çekme işleminin devam edip etmediğini belirtir
    error, // Bir hata oluşup oluşmadığını belirtir
    setFetchedData: setUserPlaces, // Çekilen verileri güncellemek için fonksiyon
    fetchedData: userPlaces, // Çekilen verileri içerir
  } = useFetch(fetchUserPlaces, []); // Boş bağımlılık dizisi ile yalnızca ilk render'da çalışır

  // Bir yeri silme işlemini başlatmak için fonksiyon
  function handleStartRemovePlace(place) {
    setModalIsOpen(true); // Modalı açar
    selectedPlace.current = place; // Seçilen yeri referansa atar
  }

  // Silme işlemini durdurmak için fonksiyon
  function handleStopRemovePlace() {
    setModalIsOpen(false); // Modalı kapatır
  }

  // Bir yeri seçme ve güncelleme işlemi için asenkron fonksiyon
  async function handleSelectPlace(selectedPlace) {
    // Kullanıcı yerlerini günceller
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces; // Eğer yer zaten varsa, aynı diziyi döndür
      }
      return [selectedPlace, ...prevPickedPlaces]; // Yeni yeri ekleyip döndür
    });

    try {
      // Kullanıcı yerlerini güncelleme API çağrısı
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces); // Hata durumunda eski yerleri geri yükle
      setErrorUpdatingPlaces({
        message: error.message || "Failed to update places.",
      });
    }
  }

  // Bir yeri silme işlemi için useCallback kullanarak asenkron fonksiyon
  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        )
      );

      try {
        // Kullanıcı yerlerini güncelleme API çağrısı (silme)
        await updateUserPlaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id)
        );
      } catch (error) {
        setUserPlaces(userPlaces); // Hata durumunda eski yerleri geri yükle
        setErrorUpdatingPlaces({
          message: error.message || "Failed to delete place.",
        });
      }

      setModalIsOpen(false); // Modalı kapatır
    },
    [userPlaces, setUserPlaces]
  );

  // Hata durumunu temizlemek için fonksiyon
  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      {/* Hata mesajı için Modal */}
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (
          <Error
            title="An error occurred!"
            message={errorUpdatingPlaces.message}
            onConfirm={handleError}
          />
        )}
      </Modal>

      {/* Silme onayı için Modal */}
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occurred!" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            isLoading={isFetching}
            loadingText="Fetching your places..."
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
