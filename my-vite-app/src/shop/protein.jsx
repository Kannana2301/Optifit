import React from "react";

const Protein = () => {
  const isolateProducts = [
    {
      id: 1,
      name: "My Protien Isolate Protein ",
      description: "Pure protein isolate with low carbs and fat.",
      price: "₹59.99",
      image: "/protienpic/myprotien.png",
       
    },
    {
      id: 2,
      name: "Optimum Nutrition(ON) Isolate Protein ",
      description: "High-quality isolate protein.",
      price: "₹54.99",
      image: "/protienpic/on.jpg",
    },
    {
      id: 3,
      name: "Ripped Up Isolate Protein ",
      description: "Fast-digesting protein for muscle recovery.",
      price: "₹64.99",
      image: "/protienpic/Ripped.png",
    },
    {
      id: 4,
      name: "Rule 1 Isolate Protein ",
      description: "Premium protein isolate with minimal sugar.",
      price: "₹69.99",
      image: "/protienpic/rule1iso.png",
    },
  ];

  const concentrateProducts = [
    {
      id: 1,
      name: "Myprotien Concentrate Protein",
      description: "Full-spectrum protein concentrate.",
      price: "₹49.99",
      image: "/protienpic/myprotieniso.png",
    },
    {
      id: 2,
      name: "Optimum Nutrition(ON)Concentrate Protein",
      description: "Great taste, easy digestibility.",
      price: "₹45.99",
      image: "/protienpic/oniso.png",
    },
    {
      id: 3,
      name: "GNC Concentrate Protein ",
      description: "Perfect for post-workout muscle recovery.",
      price: "₹52.99",
      image: "/protienpic/gncconc.jpg",
    },
    {
      id: 4,
      name: "Nutrabay Concentrate Protein ",
      description: "Affordable and high-quality whey concentrate.",
      price: "₹48.99",
      image: "/protienpic/nutrabayconc.jpg",
    },
  ];

  const plantProteinProducts = [
    {
      id: 1,
      name: "cosomix Plant Protein",
      description: "Vegan protein with pea and rice blend.",
      price: "₹44.99",
      image: "/protienpic/cosomixplant.jpg",
    },
    {
      id: 2,
      name: "AsItIs Plant Protein",
      description: "High protein content, easy digestion.",
      price: "₹47.99",
      image: "/protienpic/asitisplant.jpg",
    },
    {
      id: 3,
      name: "MuscleBlaze Plant Protein",
      description: "Ideal for muscle recovery, fully plant-based.",
      price: "₹50.99",
      image: "/protienpic/muscleblazeplant.jpg",
    },
    {
      id: 4,
      name: "ripped up Plant Protein",
      description: "Non-GMO, gluten-free plant protein.",
      price: "₹52.99",
      image: "/protienpic/rippedplant.jpg",
    },
  ];

  const renderProducts = (products) =>
    products.map((product) => (
      <div className="col-md-12 mb-4" key={product.id}>
        <div
          className="card h-100"
          style={{ backgroundColor: "white", color: "black", border: "none" }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="card-img-top"
            style={{ height: "320px", objectFit: "cover" }}
          />
          <div className="card-body d-flex flex-column">
            <h5 className="card-title">{product.name}</h5>
            <p className="card-text">{product.description}</p>
            <h6 className="mt-auto">{product.price}</h6>
            <button className="btn btn-success mt-3">Add to Cart</button>
          </div>
        </div>
      </div>
    ));

  return (
    <div
      style={{
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

      <h2 className="text-center text-white special-gothic-expanded-one-regular">
        💪 Protein Supplements
      </h2>
      <p className="text-center mb-5" style={{ maxWidth: "600px", margin: "0 auto" }}>
        Explore high-quality protein supplements from Isolate, Concentrate, and Plant-Based sources to support your fitness journey.
      </p>

      <div className="container">
        <div className="row">
          {/* Isolate Proteins */}
          <div className="col-md-4">
            <h3 className="text-white text-center mb-4">Isolate Proteins</h3>
            {renderProducts(isolateProducts)}
          </div>

          {/* Concentrate Proteins */}
          <div className="col-md-4">
            <h3 className="text-white text-center mb-4">Concentrate Proteins</h3>
            {renderProducts(concentrateProducts)}
          </div>

          {/* Plant-Based Proteins */}
          <div className="col-md-4">
            <h3 className="text-white text-center mb-4">Plant-Based Proteins</h3>
            {renderProducts(plantProteinProducts)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protein;
