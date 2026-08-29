import os
import re
import urllib.request
import shutil

os.makedirs('frontend/public/assets', exist_ok=True)
os.makedirs('frontend/public', exist_ok=True)

# Copy the high-res logo from screen 1
if os.path.exists('stitch_designs/logo.png'):
    shutil.copy('stitch_designs/logo.png', 'frontend/public/logo.png')
    shutil.copy('stitch_designs/logo.png', 'frontend/public/assets/logo.png')

img_urls = {
    'logo.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF2mZVLLWgAnivO3Eua0qfflkoBCc27R6Af4etWI8JFm0vo1HkpS8plgLVKZ4yf6b4wQJD9u3-PYRT--aFKVmOt2XcjeontsjeldRHpWrRLrtu3YifXqp6Wd6s4-AZYj4gn31UvGYQR1vZo2F2hUJdQJCmXBVfwM0XuWQDy1SAVWPu0VxQLbCxblxKDBdlnPfd5Sm8RuQ5BR9xjNfYb9pTLHCByyL1cF2h8BRFObo8lTjwmTfS336v3g',
    'org_avatar.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdMVH-tvtIBKKz_LAcEXBfNOMP1uHGJxAJo_ywM0CpPWGzwMLNOhm7lkc6MVB_o8UfdqX_Yg52m1BEP9ki3fwWlXxlh3EB_HrLa2A4zP0do26lqvAzKGHnChbuGPo2yIQLsD6j8nQ7DsIPDXySgssBUsxmk0xgBfe4vNoF8V3yvD09ugGu78ItfET86PjkcHpcfuxX6bFC12BCS7adWlx9HSZa2Jw0pmFOBqx_Mp4yyUSCdiun3r4TzA',
    'org_avatar_alt.png': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkv-1y7eQP4kEqpAeDoTjWLG_hDlFsK7oDzMoyqMudFxynDQmjaFjzcXPjq6DcOzcyx2kLMqUb2VDPiIt_D_7jYXrF7iEJoH-G-pyObW0vgB6qPhSzbOgFehsAhseZ1x7mM9bYrXGSJWPPPYNfSn-mQXwzEhltDGl8dVOAozLj04nVnToiagSf2FP1rLPcEFJez4A_0CHT2Tzbod4poDHAkRgmR9_PxfkhOt2n2j8H54kTVTELT9RXFg'
}

headers = {'User-Agent': 'Mozilla/5.0'}
for name, url in img_urls.items():
    print(f'Downloading {name} from {url}...')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(os.path.join('frontend/public/assets', name), 'wb') as f:
                f.write(data)
            with open(os.path.join('frontend/public', name), 'wb') as f:
                f.write(data)
            print(f'Successfully saved {name} ({len(data)} bytes)')
    except Exception as e:
        print(f'Error downloading {name}: {e}')

print('All assets downloaded!')
