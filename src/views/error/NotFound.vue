<template>
  <section class="error-page">
    <h1>404</h1>
    <h2>页面不存在</h2>
    <p>你访问的页面可能已移动或不存在。</p>
    <el-button type="primary" @click="$router.push('/')">回到首页</el-button>
  </section>
</template>
