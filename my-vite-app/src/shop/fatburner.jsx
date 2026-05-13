import React from "react";

const fatburner = () => {
  const fatBurners = [
    {
      id: 1,
      name: "Hydroxycut Hardcore Elite",
      description: "Powerful thermogenic formula for intense energy and fat loss.",
      price: "₹69.99",
      image:
        "https://m.media-amazon.com/images/I/61WaZ7vVfML.AC_UF1000,1000_QL80.jpg",
    },
    {
      id: 2,
      name: "Lipo-6 Black Ultra Concentrate",
      description: "Extreme potency fat burner in a single pill.",
      price: "₹64.99",
      image:
        "https://m.media-amazon.com/images/I/71zkWPaMLXL.AC_UF1000,1000_QL80.jpg",
    },
    {
      id: 3,
      name: "Leanbean for Women",
      description: "Fat burning supplement designed specifically for women.",
      price: "₹59.99",
      image:
        "https://m.media-amazon.com/images/I/61UE-6AqEDL.AC_UF1000,1000_QL80.jpg",
    },
    {
      id: 4,
      name: "Green Tea Extract",
      description: "Natural fat burner with antioxidant properties.",
      price: "₹39.99",
      image:
        "https://m.media-amazon.com/images/I/61ghdlGpFFL.AC_UF1000,1000_QL80.jpg",
    },
    {
      id: 5,
      name: "Apple Cider Vinegar Capsules",
      description: "Supports metabolism and helps burn belly fat.",
      price: "₹34.99",
      image:
        "https://m.media-amazon.com/images/I/71AqPtJh2dL.AC_UF1000,1000_QL80.jpg",
    },
    {
      id: 6,
      name: "PhenQ",
      description: "All-in-one fat burner and appetite suppressant.",
      price: "₹69.99",
      image:
        "https://m.media-amazon.com/images/I/61b8S9uExnL.AC_UF1000,1000_QL80.jpg",
    },
  ];

  return (
    <div
      style={{
         // Green background
        minHeight: "100vh",
        padding: "2rem",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Bootstrap CDN */}
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
      />

      <h2 className="text-center text-white special-gothic-expanded-one-regular" >🔥 Fat Burner Supplements</h2>
      <p className="text-center mb-5" style={{ maxWidth: "600px", margin: "0 auto" }}>
        Discover top-quality fat burner supplements to help you reach your fitness goals faster. Choose from thermogenic boosters, natural options, and more.
      </p>

      <div className="container">
        <div className="row">
          {fatBurners.map((product) => (
            <div className="col-md-4 mb-4" key={product.id}>
              <div
                className="card h-100"
                style={{ backgroundColor: "white", color: "black", border: "none" }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description}</p>
                  <h6 className="mt-auto">{product.price}</h6>
                  <button className="btn btn-success mt-3">Add to Cart</button> {/* Green button */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default fatburner;
