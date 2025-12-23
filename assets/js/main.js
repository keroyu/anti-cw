/**
 * 反認知作戰教育資源網 - 共用 JavaScript
 * 版本: 2.0 (Jekyll 重構版)
 */

(function() {
    'use strict';

    // ===== 懸浮導航按鈕 =====
    const backToNavBtn = document.getElementById('back-to-nav');
    const navTabsAnchor = document.getElementById('nav-tabs-anchor');

    function initBackToNavButton() {
        if (!backToNavBtn || !navTabsAnchor) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        backToNavBtn.classList.remove('visible');
                    } else {
                        backToNavBtn.classList.add('visible');
                    }
                });
            },
            { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
        );

        observer.observe(navTabsAnchor);

        backToNavBtn.addEventListener('click', function() {
            navTabsAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // ===== 手風琴展開/收合 =====
    function initAccordion() {
        document.querySelectorAll('.item-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isActive = this.classList.contains('active');

                // 收合其他項目（可選：改為 toggle 單一項目）
                // document.querySelectorAll('.item-header').forEach(h => {
                //     h.classList.remove('active');
                //     h.nextElementSibling.classList.remove('active');
                // });

                if (!isActive) {
                    this.classList.add('active');
                    content.classList.add('active');
                } else {
                    this.classList.remove('active');
                    content.classList.remove('active');
                }
            });
        });
    }

    // ===== 影片大綱展開/收合 =====
    window.toggleOutline = function(btn) {
        const card = btn.closest('.video-card');
        const outline = card.querySelector('.video-outline');

        if (outline.style.display === 'none' || outline.style.display === '') {
            outline.style.display = 'block';
            btn.classList.add('active');
            btn.querySelector('span').textContent = '收合影片大綱';
        } else {
            outline.style.display = 'none';
            btn.classList.remove('active');
            btn.querySelector('span').textContent = '觀看影片大綱';
        }
    };

    // ===== 更多影片展開/收合 =====
    window.toggleMoreVideos = function() {
        const btn = document.querySelector('.expand-videos-btn');
        const content = document.querySelector('.more-videos-content');

        if (!btn || !content) return;

        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            setTimeout(() => content.classList.add('show'), 10);
            btn.classList.add('expanded');
            btn.querySelector('.expand-text').textContent = '收合更多影片';
        } else {
            content.classList.remove('show');
            setTimeout(() => { content.style.display = 'none'; }, 500);
            btn.classList.remove('expanded');
            btn.querySelector('.expand-text').textContent = '顯示更多影片';
        }
    };

    // ===== 燈箱功能 =====
    let currentSlideshow = null;
    let currentIndex = 0;
    let slideshowImages = [];

    window.openLightbox = function(slideshowId, index) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const slideshow = document.querySelector(`[data-slideshow="${slideshowId}"]`);

        if (!slideshow || !lightbox) return;

        slideshowImages = Array.from(slideshow.querySelectorAll('.slide img'));
        currentSlideshow = slideshowId;
        currentIndex = index;

        lightboxImg.src = slideshowImages[index].src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        updateLightboxCounter();
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.lightboxNav = function(direction) {
        currentIndex += direction;
        if (currentIndex < 0) currentIndex = slideshowImages.length - 1;
        if (currentIndex >= slideshowImages.length) currentIndex = 0;

        const lightboxImg = document.getElementById('lightbox-img');
        lightboxImg.src = slideshowImages[currentIndex].src;
        updateLightboxCounter();
    };

    function updateLightboxCounter() {
        const current = document.getElementById('lightbox-current');
        const total = document.getElementById('lightbox-total');
        if (current) current.textContent = currentIndex + 1;
        if (total) total.textContent = slideshowImages.length;
    }

    // 燈箱鍵盤操作
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxNav(-1);
        if (e.key === 'ArrowRight') lightboxNav(1);
    });

    // 點擊背景關閉燈箱
    document.addEventListener('click', function(e) {
        if (e.target.id === 'lightbox') {
            closeLightbox();
        }
    });

    // ===== 幻燈片滾動 =====
    window.scrollSlides = function(slideshowId, direction) {
        const slideshow = document.querySelector(`[data-slideshow="${slideshowId}"]`);
        if (!slideshow) return;

        const wrapper = slideshow.querySelector('.slides-wrapper');
        const slideWidth = wrapper.querySelector('.slide').offsetWidth + 10;
        wrapper.scrollBy({ left: direction * slideWidth * 2, behavior: 'smooth' });
    };

    // ===== 分享連結功能 =====
    window.copyShareLink = function(anchorId) {
        const url = window.location.origin + window.location.pathname + '#' + anchorId;
        const btn = event.target.closest('.share');

        // 複製到剪貼簿（含 fallback）
        function copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            }
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return Promise.resolve();
        }

        // 顯示按鈕回饋
        function showFeedback() {
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '已複製!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 1000);
            }
        }

        copyToClipboard(url).then(showFeedback).catch(showFeedback);
    };

    // ===== 滾動動畫 (時間軸頁面) =====
    function initScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        // 觀察時間軸項目
        document.querySelectorAll('.timeline-item').forEach(item => {
            observer.observe(item);
        });

        // 觀察警告卡片
        document.querySelectorAll('.urgent-warning-card').forEach(card => {
            observer.observe(card);
        });

        // 觀察標題
        document.querySelectorAll('.bamian-title').forEach(title => {
            observer.observe(title);
        });
    }

    // ===== 處理 URL Hash (分享連結跳轉) =====
    function handleHashNavigation() {
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }
    }

    // ===== 初始化 =====
    document.addEventListener('DOMContentLoaded', function() {
        initBackToNavButton();
        initAccordion();
        initScrollAnimations();
        handleHashNavigation();
    });

})();
