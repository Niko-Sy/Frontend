<template>
  <section class="error-page">
    <h1>404</h1>
    <h2>页面没有找到</h2>
    <p>链接可能已经失效，或者你访问了一个不存在的页面。</p>
    <el-button type="primary" @click="$router.push('/')">回到首页</el-button>
  </section>
</template>
