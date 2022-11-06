import PassEntry from "../ts/PassEntry"
// Aquired from devtools with  
//
//  console.log(JSON.stringify(rootEntry)) | jq -rM
//
const dummyData = {
  "name": "",
  "subpaths": [
    "Github/Jane0x1",
    "Github/Jane0x2",
    "Wallets/eth/main",
    "Wallets/xmr/frozen",
    "Wallets/xmr/main",
    "mastercard",
    "visa"
  ],
  "parents": [],
  "subitems": [
    {
      "name": "Github",
      "subpaths": [
        "Github/Jane0x1",
        "Github/Jane0x2"
      ],
      "parents": [],
      "subitems": [
        {
          "name": "Jane0x1",
          "subpaths": [],
          "parents": [
            "Github"
          ],
          "subitems": []
        },
        {
          "name": "Jane0x2",
          "subpaths": [],
          "parents": [
            "Github"
          ],
          "subitems": []
        }
      ]
    },
    {
      "name": "Wallets",
      "subpaths": [
        "Wallets/eth/main",
        "Wallets/xmr/frozen",
        "Wallets/xmr/main"
      ],
      "parents": [],
      "subitems": [
        {
          "name": "eth",
          "subpaths": [
            "eth/main"
          ],
          "parents": [
            "Wallets"
          ],
          "subitems": [
            {
              "name": "main",
              "subpaths": [],
              "parents": [
                "Wallets",
                "eth"
              ],
              "subitems": []
            }
          ]
        },
        {
          "name": "xmr",
          "subpaths": [
            "xmr/frozen",
            "xmr/main"
          ],
          "parents": [
            "Wallets"
          ],
          "subitems": [
            {
              "name": "frozen",
              "subpaths": [],
              "parents": [
                "Wallets",
                "xmr"
              ],
              "subitems": []
            },
            {
              "name": "main",
              "subpaths": [],
              "parents": [
                "Wallets",
                "xmr"
              ],
              "subitems": []
            }
          ]
        }
      ]
    },
    {
      "name": "mastercard",
      "subpaths": [],
      "parents": [],
      "subitems": []
    },
    {
      "name": "visa",
      "subpaths": [],
      "parents": [],
      "subitems": []
    }
  ]
}

const rootDummy = new PassEntry("", [], [], [])
rootDummy.loadFromJSON(dummyData)

export { rootDummy }
