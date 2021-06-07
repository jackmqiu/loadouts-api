# loadouts-api

Deployment

merge to master and changes will auto deploy via elasticbeanstalk

### Submit loadout
POST /make
```
{
	"_id": "jaksloadout3",
	"email": "jackqiu2016@gmail.com",
  "category": "airsoft",
  "items":
      {
      "0": {
          "productLink": "https://www.vipertech.com.tw/download_txt.php?num=32",
          "imageLink": "https://i.ytimg.com/vi/IxRs8Y8ZXuc/maxresdefault.jpg",
          "productName": "VIPER TECH | 毒蛇科技 VIPER TECH M4A1 MOE GBB (Steel ..."
      },
      "1": {
          "productLink": "https://www.surefire.com/products/other/m622u-scout-light-weaponlight/",
          "imageLink": "https://assets.surefire.com/uploads/2019/07/2134_source_1587581537.jpg",
          "productName": "M622U Scout Light WeaponLight - SureFire"
      },
      "2": {
          "productLink": "https://www.evike.com/products/52109/",
          "imageLink": "https://www.evike.com/images/fl-ex276de-sm.jpg",
          "productName": "Element EX276 Airsoft PEQ Flash Light / Red Laser / IR Device ..."
      },
      "3": {
          "productLink": "https://www.evike.com/products/13205/",
          "imageLink": "https://www.evike.com/images/vtac-13205-sm.jpg",
          "productName": "Viking Tactics 2 Point Wide Padded Hybrid Sling (Color: Multicam ..."
      },
      "4": {
          "productLink": "https://www.evike.com/products/30032/",
          "imageLink": "https://www.evike.com/images/grip-tg18-b-sm.jpg",
          "productName": "Stubby RIS Tactical Vertical Support Fore Grip For Airsoft (Color ..."
      },
      "5": {
          "productLink": "https://www.evike.com/products/94193/",
          "imageLink": "https://www.evike.com/images/ghk-94193-sm.jpg",
          "productName": "GHK Daniel Defense Licensed MK18 M4A1 RIS II Airsoft CNC ..."
      }
  }
}
```
