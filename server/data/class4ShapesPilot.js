// Original Vayentra teaching material, not text copied from NCERT.
// Mapping reference: NCERT Class 4 Maths Mela (2025 onward), Chapter 1 Shapes Around Us.
// The draft set needs educator review against the edition used by each school.
export const CLASS4_SHAPES_PILOT={
 courseKey:'vg-c4-cbse-shapes-2026',
 board:'CBSE',grade:4,year:'2026-27',subject:'Mathematics',
 textbook:'Maths Mela',chapterNumber:1,chapterTitle:'Shapes Around Us',
 publisherReference:'https://ncert.nic.in/textbook.php?cemm1=ps-14',
 editorialStatus:'draft_unreviewed',
 note:'Original authored prototype. No copied textbook pages, images, examination questions or licensed third-party media.',
 lessons:[
  {
    "key": "objects",
    "title": "Meet the shapes you can hold",
    "objective": "Recognise three-dimensional shapes and connect them with familiar objects.",
    "bridge": "Remember flat shapes such as a circle and square. A ball or box is different: it takes up space and can be held.",
    "explanation": "Look carefully at an empty cardboard box, a ball, a drinking glass and a party hat. All of them occupy space. We call shapes like these solid or three-dimensional shapes. A box with six square faces is a cube; a longer box is often a cuboid. A ball resembles a sphere, a straight tin resembles a cylinder, and a party hat resembles a cone. The same everyday object can have more than one interesting feature: a cylinder has two flat circular ends and a curved surface. When you learn the shape name, do not just memorise it. Look for what makes that shape different. Can it roll? Does it have flat faces? Can it stand on a flat base? Try to find three safe objects around you and describe them using these questions.",
    "steps": [
      "Observe a real object from more than one side.",
      "Find its flat faces, curved surfaces and corners.",
      "Name the solid shape using these features.",
      "Compare it with another everyday object."
    ],
    "example": "A closed dice has six equal square faces, so it models a cube. A shoebox usually has rectangular faces and models a cuboid.",
    "misconception": "A circle is flat, while a sphere is solid. Calling a ball a circle confuses a drawing with an object.",
    "action": "Find a safe box, tin and ball at home. Draw each and explain which parts are flat or curved.",
    "visual": "solids",
    "questions": [
      [
        "Which object is the best example of a sphere?",
        [
          "A dice",
          "A ball",
          "A notebook",
          "A matchbox"
        ],
        1,
        "A sphere is round in every direction, like a ball.",
        "flat_vs_solid"
      ],
      [
        "Which solid usually has six square faces of equal size?",
        [
          "Cube",
          "Cone",
          "Sphere",
          "Cylinder"
        ],
        0,
        "A cube has six congruent square faces.",
        "cube_properties"
      ],
      [
        "A food tin is usually shaped like a…",
        [
          "Sphere",
          "Pyramid",
          "Cylinder",
          "Triangle"
        ],
        2,
        "A tin has circular ends joined by a curved side; that makes it cylindrical.",
        "solid_identification"
      ],
      [
        "Which shape can roll smoothly in any direction on a level surface?",
        [
          "Sphere",
          "Cube",
          "Cuboid",
          "Square pyramid"
        ],
        0,
        "A sphere has a curved surface in every direction.",
        "curved_vs_flat"
      ]
    ]
  },
  {
    "key": "faces",
    "title": "Faces, edges and corners",
    "objective": "Count the faces, edges and vertices of a cube, cuboid and simple pyramid.",
    "bridge": "Think about a cardboard box. You can touch its sides, trace its straight boundaries and point to its corners.",
    "explanation": "A solid has features we can count. A face is one flat surface of a polyhedron, such as the top of a cardboard box. An edge is the line segment where two flat faces meet. A vertex is a corner where edges meet. Try this with a cube: point to one square face; then follow the line where that face meets its neighbour; finally touch the point where several edges join. A cube and a cuboid each have six faces, twelve edges and eight vertices. A triangular pyramid is different: it has four triangular faces, six edges and four vertices. Rather than guessing the counts from a picture, rotate a real model or trace a drawing systematically, marking each counted feature. When we learn these words carefully, later shape puzzles become much easier.",
    "steps": [
      "Point to a single flat face of a box.",
      "Trace an edge between two touching faces.",
      "Find a vertex where edges meet.",
      "Count each feature carefully; mark it once to avoid double-counting."
    ],
    "example": "For a cube, faces = 6, edges = 12, vertices = 8. A triangular pyramid has 4 faces, 6 edges and 4 vertices.",
    "misconception": "A line drawn inside a face is not necessarily an edge. An edge is part of the solid's boundary where faces meet.",
    "action": "With adult supervision, label three faces, three edges and three vertices on a recycled box.",
    "visual": "cube",
    "questions": [
      [
        "How many flat faces does a cube have?",
        [
          "4",
          "6",
          "8",
          "12"
        ],
        1,
        "There are six square faces: front, back, left, right, top and bottom.",
        "face_count"
      ],
      [
        "How many edges does a cube have?",
        [
          "6",
          "8",
          "12",
          "4"
        ],
        2,
        "Each of the six faces touches other faces along edges; there are twelve distinct edges in total.",
        "edge_count"
      ],
      [
        "What is a vertex?",
        [
          "The middle of a face",
          "A corner where edges meet",
          "Any curved surface",
          "The colour of a shape"
        ],
        1,
        "A vertex is a corner point of a polyhedron.",
        "vertex_definition"
      ],
      [
        "How many vertices does a cuboid have?",
        [
          "6",
          "8",
          "10",
          "12"
        ],
        1,
        "A cuboid has eight vertices, just like a cube.",
        "cuboid_count"
      ]
    ]
  },
  {
    "key": "families",
    "title": "Prisms, pyramids and patterns",
    "objective": "Distinguish prisms from pyramids and compare their faces, edges and vertices.",
    "bridge": "You already know boxes have many flat faces. Now look at how those faces fit together.",
    "explanation": "A prism has two matching, parallel polygon faces called bases, joined by side faces. A triangular prism has two triangular ends; a cube is also a special kind of square prism. A pyramid has one polygon base and triangular side faces that meet at one point called the apex. For example, a square pyramid has one square base and four triangular side faces. It has five faces, eight edges and five vertices. A triangular prism has five faces, nine edges and six vertices. Compare the solids instead of memorising isolated numbers: where are the matching ends? Where do the triangles meet? A fun extra pattern for closed solids made entirely of flat polygon faces is that faces plus vertices minus edges equals two. Verify it with a cube before trying another solid.",
    "steps": [
      "Find the base or pair of matching ends.",
      "Check whether side faces rise to one shared apex.",
      "Count faces, edges and vertices on a labelled model.",
      "Test the faces + vertices − edges pattern with a cube."
    ],
    "example": "A square pyramid has 5 faces, 8 edges and 5 vertices. Check: 5 + 5 − 8 = 2.",
    "misconception": "Not every prism looks like a tall rectangular box. A triangular prism has two triangular ends.",
    "action": "Sketch one triangular prism and one square pyramid. Circle what makes them different.",
    "visual": "families",
    "questions": [
      [
        "Which shape has triangular sides meeting at one apex?",
        [
          "Prism",
          "Pyramid",
          "Cylinder",
          "Sphere"
        ],
        1,
        "Triangular side faces of a pyramid meet at a single apex.",
        "prism_pyramid"
      ],
      [
        "How many faces does a square pyramid have?",
        [
          "4",
          "5",
          "6",
          "8"
        ],
        1,
        "There is one square base and four triangular faces: five in all.",
        "pyramid_faces"
      ],
      [
        "A triangular prism has how many triangular bases?",
        [
          "1",
          "2",
          "3",
          "4"
        ],
        1,
        "A triangular prism has two matching and parallel triangular ends.",
        "prism_bases"
      ],
      [
        "For a cube, faces + vertices − edges is…",
        [
          "0",
          "2",
          "6",
          "14"
        ],
        1,
        "6 + 8 − 12 = 2.",
        "polyhedron_relationship"
      ]
    ]
  },
  {
    "key": "nets",
    "title": "From flat paper to a solid",
    "objective": "Explain how a net folds into a three-dimensional solid.",
    "bridge": "If you carefully open a small cardboard box along its edges, it can become a connected flat pattern.",
    "explanation": "A net is a flat arrangement of faces that can be folded to make a solid without overlapping faces. Imagine six square pieces joined edge to edge. If their arrangement is correct, folding them can make a cube. But six squares alone are not enough: some arrangements would overlap when folded, while others would leave gaps. The easiest way to reason about nets is to identify a base, imagine which squares fold upward around it and check where the remaining face will close the solid. A simple cube net can look like a cross with four squares in a row and one above and below the second square. A real model is valuable here: cut and fold scrap paper with an adult if scissors are needed. Nets help us understand how the flat faces of a solid connect in three dimensions.",
    "steps": [
      "Start with a flat drawing of joined faces.",
      "Choose a base face and imagine the neighbours folding up.",
      "Check whether one final face closes the solid without overlap.",
      "Make and test a paper model with an adult."
    ],
    "example": "Six equal squares arranged as a valid cube net can fold into six faces of a cube. A disconnected set of six squares cannot fold as a single net.",
    "misconception": "Any drawing with six squares is not automatically a cube net; the layout and joins matter.",
    "action": "Draw a safe paper cube net and fold it with help. Record whether all six faces close.",
    "visual": "net",
    "questions": [
      [
        "A net is…",
        [
          "A solid ball",
          "A flat connected pattern that folds into a solid",
          "A unit of length",
          "A curved line"
        ],
        1,
        "A net is a flat pattern of faces that folds into a three-dimensional solid.",
        "net_definition"
      ],
      [
        "How many square faces are required for a cube net?",
        [
          "4",
          "5",
          "6",
          "8"
        ],
        2,
        "A cube has exactly six square faces.",
        "net_face_count"
      ],
      [
        "Why might six joined squares fail to make a cube?",
        [
          "Because squares are curved",
          "Because all squares are too flat",
          "Because the arrangement may overlap or leave gaps",
          "Because cubes have circles"
        ],
        2,
        "The positioning of squares matters, not just their number.",
        "folding_logic"
      ],
      [
        "What should you check when folding a cube net?",
        [
          "That faces overlap",
          "That no faces overlap and the solid closes",
          "That two squares disappear",
          "That corners become circles"
        ],
        1,
        "A working net closes neatly without overlaps.",
        "spatial_reasoning"
      ]
    ]
  },
  {
    "key": "angles",
    "title": "Angles and strong triangles",
    "objective": "Identify right, acute and obtuse angles and investigate why triangles are rigid.",
    "bridge": "Open a book like a door, then notice the gap between its covers. Two directions can meet at an angle.",
    "explanation": "An angle describes the amount of turning between two rays meeting at a point. A right angle is a quarter turn, like a square corner of a notebook. An acute angle is smaller than a right angle. An obtuse angle is larger than a right angle but smaller than a straight angle. To check an angle, you can use the square corner of a sheet of paper as a simple reference. Angles also help explain structures. If you make a loose frame from four straight sticks, it can lean sideways without changing stick lengths. Join three sticks in a triangle and the shape is more rigid: the three fixed lengths determine its shape. That is why triangles often appear as bracing in roofs and bridges. When investigating, compare the stability of the frames safely without climbing or using tools.",
    "steps": [
      "Locate the point where the sides of an angle meet.",
      "Compare its opening to a square corner.",
      "Name it acute, right or obtuse.",
      "Compare a loose square frame with a triangular frame."
    ],
    "example": "A 90° turn is right. A 45° opening is acute. A 120° opening is obtuse.",
    "misconception": "An angle's size is about its opening, not how long you draw the two arms.",
    "action": "Find one angle smaller than a book's square corner and one larger. Draw both.",
    "visual": "angles",
    "questions": [
      [
        "An angle smaller than a right angle is…",
        [
          "Acute",
          "Obtuse",
          "Straight",
          "Full turn"
        ],
        0,
        "Acute angles are less than 90°.",
        "angle_type"
      ],
      [
        "Which opening is a right angle?",
        [
          "45°",
          "90°",
          "120°",
          "180°"
        ],
        1,
        "A right angle is exactly 90°, or a quarter turn.",
        "right_angle"
      ],
      [
        "Which simple frame usually holds its shape better with fixed lengths?",
        [
          "A loose square",
          "A triangle",
          "An open line",
          "A curve"
        ],
        1,
        "Three fixed sides form a rigid triangle, unlike a hinged quadrilateral.",
        "triangle_rigidity"
      ],
      [
        "An angle of 120° is…",
        [
          "Acute",
          "Right",
          "Obtuse",
          "Zero"
        ],
        2,
        "It is greater than 90° and less than 180°.",
        "angle_type"
      ]
    ]
  },
  {
    "key": "circles",
    "title": "Inside a circle: radius and diameter",
    "objective": "Understand centre, radius and diameter, and why diameter is twice radius.",
    "bridge": "Imagine drawing around a coin or a round plate. You get a circle with a centre.",
    "explanation": "A circle is the set of points in a flat plane that are the same distance from its centre. The distance from the centre to any point on the circle is called the radius. A straight line segment that runs from one side of the circle to the other through the centre is a diameter. A diameter contains two radii end to end, so diameter = 2 × radius. If you know the diameter, radius = diameter ÷ 2. The length of the diameter is not the same as the distance around the circle; that outer distance is called the circumference. When you draw a circle, mark its centre, then draw and label a radius before the diameter. Try measuring a safe round lid with a ruler. Not every line across the circle is a diameter: it must pass through the centre.",
    "steps": [
      "Mark the centre of a circle.",
      "Draw a segment from centre to edge: the radius.",
      "Draw a segment from edge to edge through centre: the diameter.",
      "Compare their lengths by using two radius lengths."
    ],
    "example": "A circle with radius 4 cm has diameter 8 cm. A circle with diameter 12 cm has radius 6 cm.",
    "misconception": "A line that joins two points on a circle but misses the centre is not a diameter.",
    "action": "Draw a circle, label its centre, a radius and a diameter. Explain why one is twice the other.",
    "visual": "circle",
    "questions": [
      [
        "A radius goes from…",
        [
          "Edge to edge without the centre",
          "Centre to the circle",
          "Outside to outside",
          "One corner to another"
        ],
        1,
        "Every radius connects the centre with a point on the circle.",
        "radius_definition"
      ],
      [
        "If the radius is 5 cm, the diameter is…",
        [
          "2.5 cm",
          "5 cm",
          "10 cm",
          "15 cm"
        ],
        2,
        "A diameter is two radii: 2 × 5 = 10 cm.",
        "diameter_double"
      ],
      [
        "If the diameter is 14 cm, the radius is…",
        [
          "7 cm",
          "14 cm",
          "28 cm",
          "4 cm"
        ],
        0,
        "The radius is half the diameter: 14 ÷ 2 = 7 cm.",
        "inverse_radius"
      ],
      [
        "A line from one side of the circle to the other is a diameter only if it…",
        [
          "Is coloured red",
          "Passes through the centre",
          "Is curved",
          "Is shorter than the radius"
        ],
        1,
        "A diameter must pass through the circle's centre.",
        "diameter_definition"
      ]
    ]
  }
]
};
