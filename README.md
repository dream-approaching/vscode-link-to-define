## link-to-define

> 内部项目使用

### 更新日志

#### [v0.1.15] - 2020-12-14

- 增加对 `import md` 的跳转
- 支持在 `setting.json` 中配置 `alias`. `{root}`表示根目录
  ```json
  "linkToDefine.alias": {
      "@components": "{root}/src/components",
      "@config": "{root}/src/config",
  }
  ```

#### [v0.1.12] - 2020-11-11

- 修复 import 相对路径跳转失败的问题
- 修复 `WxService.navigateTo(path)` 相对路径跳转失败的问题
- 鉴于有些项目 api 跳转方法名不叫 ajax，增加 ajax api 跳转的方法名配置，默认为 'ajax'

#### [v0.1.10] - 2020-11-10

- 支持小程序项目中 `path` 的跳转，包含
  - `WxService.navigateTo(path)`
  - app.json 中的 path
  - ext.json 中的 path
  - wxml 中的图片 path

#### [v0.1.9] - 2020-11-09

- 支持小程序项目中 `wxml` 和 `json` 文件中组件的点击跳转

#### [v0.1.7] - 2020-11-02

- webapp 项目和小程序项目可跳转`ajax api`
