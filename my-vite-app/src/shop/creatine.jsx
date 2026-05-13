import React from "react";

const Creatine = () => {
  const creatineProducts = [
    {
      id: 1,
      name: "Wellcore Nutrition Creatine",
      description: "Micronized creatine for maximum absorption.",
      price: "₹1499",
      image: "/creatinepic/wellcore.png",
    },
    {
      id: 2,
      name: "Optimum Nutrition (ON) Creatine",
      description: "Unflavored pure creatine monohydrate powder.",
      price: "₹1099",
      image: "/creatinepic/on.jpg",
    },
    {
      id: 3,
      name: "GNC Creatine",
      description: "100% pure creatine for faster recovery.",
      price: "₹1299",
      image: "/creatinepic/gnc.jpg",
    },
    {
      id: 4,
      name: "nutrabay Creatine",
      description: "Powerful creatine supplement for intense workouts.",
      price: "₹1199",
      image: "/creatinepic/nutrabay.jpg",
    },
    {
      id: 5,
      name: "Ripped up creatine",
      description: "Premium creatine hydrochloride for better solubility.",
      price: "₹1699",
      image: "/creatinepic/ripped.jpg",
    },
    {
      id: 6,
      name: "BPI Sports Creatine",
      description: "Enhanced creatine formula for muscle strength.",
      price: "₹1399",
      image: "https://m.media-amazon.com/images/I/71rybwMBemL.AC_UL1000.jpg",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#FF8C00",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {/* Bootstrap CDN */}
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
      />

      <h1 className="text-center text-white special-gothic-expanded-one-regular" style={{ color: "#fff" }}>
        💪 Creatine Supplements
      </h1>
      <p
        className="text-center mb-5"
        style={{ maxWidth: "600px", margin: "0 auto", color: "#fff" }}
      >
        Browse our selection of top creatine supplements to enhance your workout
        performance and build muscle.
      </p>

      <div className="container">
        <div className="row">
          {creatineProducts.map((product) => (
            <div className="col-md-4 mb-4" key={product.id}>
              <div
                className="card h-100"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  overflow: "hidden",
                }}
              >
                <div style={{ height: "250px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-img-top"
                    style={{ height: "250px", objectFit: "cover", width: "100%" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&q=80";
                    }}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <h5
                    className="card-title"
                    style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}
                  >
                    {product.name}
                  </h5>
                  <p
                    className="card-text"
                    style={{ color: "#555", fontSize: "14px" }}
                  >
                    {product.description}
                  </p>
                  <h6
                    className="mt-auto"
                    style={{ color: "#FF5F00", fontWeight: "bold" }}
                  >
                    {product.price}
                  </h6>
                  <button
                    className="btn btn-success mt-3"
                    style={{
                      borderRadius: "5px",
                      padding: "10px 15px",
                      fontSize: "16px",
                      backgroundColor: "#FF8C00",
                      border: "none",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Creatine;
